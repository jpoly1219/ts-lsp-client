import { Readable, Transform, TransformCallback, TransformOptions } from "stream";

type ReceiveState = 'header' | 'jsonrpc';

export class JSONRPCTransform extends Transform {
  private _state: ReceiveState;
  private _curContentLength: number;
  private _curChunk: Buffer;

  private constructor(options?: TransformOptions) {
    options = options || {};
    options.objectMode = true;
    super(options);

    this.on('pipe', (src) => {
      if (!this.readableEncoding) {
        if (src instanceof Readable) {
          this.setEncoding(src.readableEncoding);
        }
      }
    });

    this._curChunk = Buffer.from([]);
    this._state = 'header';
  }


  public _transform(chunk: Buffer | string, encoding: BufferEncoding, done: TransformCallback): void {
    // decode binary chunks as UTF-8
    encoding = encoding || 'utf8';

    if (!Buffer.isBuffer(chunk)) {
      chunk = Buffer.from(chunk, encoding);
    }

    this._curChunk = Buffer.concat([this._curChunk, chunk]);
    // console.log("===")
    // console.log(this._curChunk.toString(encoding))

    const prefixMinLength = Buffer.byteLength('Content-Length: 0\r\n\r\n', encoding);
    const prefixLength = Buffer.byteLength('Content-Length: ', encoding);
    const prefixRegex = /^Content-Length: /i;
    const contentTypeLength = Buffer.byteLength('Content-Type: ', encoding);
    const contentTypeRe = /^Content-Type: /i;
    const digitLength = Buffer.byteLength('0', encoding);
    const digitRe = /^[0-9]/;
    const suffixLength = Buffer.byteLength('\r\n\r\n', encoding);
    const suffixRe = /\r\n\r\n/;
    const crlfLength = Buffer.byteLength('\r\n', encoding);
    const crlfRe = /^\r\n/;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this._state === 'header') {
        // Not enough data for a content length match
        if (this._curChunk.length < prefixMinLength)
          break;

        const leading = this._curChunk.slice(0, prefixLength);
        if (!prefixRegex.test(leading.toString(encoding))) {
          done(new Error(`[_transform] Bad header: ${this._curChunk.toString(encoding)}`));
          return;
        }

        let numString = '';
        let position = leading.length;
        while (this._curChunk.length - position > digitLength) {
          const ch = this._curChunk.slice(position, position + digitLength).toString(encoding);
          if (!digitRe.test(ch))
            break;

          numString += ch;
          position += 1;
        }

        if (position === leading.length || this._curChunk.length - position < crlfLength) {
          done(new Error(`[_transform] Bad header: ${this._curChunk.toString(encoding)}`));
          return;
        }

        this._curContentLength = Number(numString);
        this._curChunk = this._curChunk.slice(position + crlfLength);

        // content-type parsing if exists
        const ctyp = this._curChunk.slice(0, contentTypeLength);
        const noCtyp = this._curChunk.slice(0, crlfLength);
        const isCtyp = contentTypeRe.test(ctyp.toString(encoding));
        const isNoCtyp = crlfRe.test(noCtyp.toString(encoding));

        if (!isNoCtyp && !isCtyp) {
          done(new Error(`[_transform] Bad header: ${this._curChunk.toString(encoding)}`));
          return;
        }

        if (isNoCtyp) {
          this._curChunk = this._curChunk.slice(crlfLength);
        }

        if (isCtyp) {
          const index = this._curChunk.toString(encoding).search(suffixRe);
          if (index === -1) {
            done(new Error(`[_transform] Bad header: ${this._curChunk.toString(encoding)}`));
            return;
          }
          position = index;
          this._curChunk = this._curChunk.slice(position + suffixLength);
        }

        this._state = 'jsonrpc';
      }

      if (this._state === 'jsonrpc') {
        if (this._curChunk.length >= this._curContentLength) {
          this.push(this._reencode(this._curChunk.slice(0, this._curContentLength), encoding));
          this._curChunk = this._curChunk.slice(this._curContentLength);
          this._state = 'header';

          continue;
        }
      }

      break;
    }
    done();
  }

  private _reencode(chunk: Buffer, chunkEncoding: BufferEncoding) {
    if (this.readableEncoding && this.readableEncoding != chunkEncoding) {
      return chunk.toString(this.readableEncoding);
    } else if (this.readableEncoding) {
      // this should be the most common case, i.e. we're using an encoded source stream
      return chunk.toString(chunkEncoding);
    } else {
      return chunk;
    }
  };

  public static createStream(readStream?: Readable, options?: TransformOptions): JSONRPCTransform {
    const jrt = new JSONRPCTransform(options);
    if (readStream) {
      readStream.pipe(jrt);
    }
    return jrt;
  }
}
