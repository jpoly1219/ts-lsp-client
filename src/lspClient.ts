import { JSONRPCEndpoint } from "./jsonRpcEndpoint";
import {
  DefinitionParams,
  DidChangeTextDocumentParams,
  DidCloseTextDocumentParams,
  DidOpenTextDocumentParams,
  DocumentSymbol,
  DocumentSymbolParams,
  InitializeParams,
  InitializeResult,
  LocationLink,
  ReferenceParams,
  ResponseError,
  ShutdownResult,
  SignatureHelp,
  SignatureHelpParams,
  SymbolInformation,
  TypeDefinitionParams,
  Location,
  HoverParams,
  Hover,
  DeclarationParams,
  CompletionParams,
  CompletionItem,
  CompletionList,
  InlayHintParams,
  InlayHint,
  TypeHierarchyPrepareParams,
  TypeHierarchyItem,
  Range,
  DocumentDiagnosticParams,
  DocumentDiagnosticReport,
  OcamlTypedHolesParams,
  OcamlHoverExtendedParams,
  OcamlInferIntfParams,
  OcamlMerlinCallCompatibleParams,
  OcamlMerlinCallCompatibleResponse,
  OcamlTypeEnclosingParams,
  OcamlTypeEnclosingResponse,
  OcamlInferIntfResponse
} from "./models";
import { once } from 'events';
export class LspClient {

  private endpoint: JSONRPCEndpoint;

  public constructor(endpoint: JSONRPCEndpoint) {
    this.endpoint = endpoint;
  }

  public initialize(params: InitializeParams): PromiseLike<InitializeResult> {
    return this.endpoint.send('initialize', params);
  }

  public initialized(): void {
    this.endpoint.notify('initialized');
  }

  public shutdown(): PromiseLike<ShutdownResult> {
    return this.endpoint.send('shutdown');
  }

  public exit(): void {
    this.endpoint.notify('exit');
  }

  public didOpen(params: DidOpenTextDocumentParams): void {
    this.endpoint.notify('textDocument/didOpen', params);
  }

  public didClose(params: DidCloseTextDocumentParams): void {
    this.endpoint.notify('textDocument/didClose', params);
  }

  public didChange(params: DidChangeTextDocumentParams): void {
    this.endpoint.notify('textDocument/didChange', params);
  }

  public documentSymbol(params: DocumentSymbolParams): PromiseLike<DocumentSymbol[] | SymbolInformation[] | null> {
    return this.endpoint.send('textDocument/documentSymbol', params);
  }

  public references(params: ReferenceParams): PromiseLike<Location[] | ResponseError | null> {
    return this.endpoint.send('textDocument/references', params);
  }

  public definition(params: DefinitionParams): PromiseLike<Location | Location[] | LocationLink[] | ResponseError | null> {
    return this.endpoint.send('textDocument/definition', params);
  }

  public typeDefinition(params: TypeDefinitionParams): PromiseLike<Location | Location[] | LocationLink[] | ResponseError | null> {
    return this.endpoint.send('textDocument/typeDefinition', params);
  }

  public signatureHelp(params: SignatureHelpParams): PromiseLike<SignatureHelp | null> {
    return this.endpoint.send('textDocument/signatureHelp', params);
  }

  public once(method: string): ReturnType<typeof once> {
    return once(this.endpoint, method);
  }

  public hover(params: HoverParams): PromiseLike<Hover> {
    return this.endpoint.send('textDocument/hover', params);
  }

  public gotoDeclaration(params: DeclarationParams): PromiseLike<Location | Location[] | LocationLink[] | null> {
    return this.endpoint.send('textDocument/declaration', params);
  }

  public completion(params: CompletionParams): PromiseLike<CompletionItem[] | CompletionList | null> {
    return this.endpoint.send('textDocument/completion', params);
  }

  public inlayHint(params: InlayHintParams): PromiseLike<InlayHint[] | null> {
    return this.endpoint.send('textDocument/inlayHint', params);
  }

  public prepareTypeHierarchy(params: TypeHierarchyPrepareParams): PromiseLike<TypeHierarchyItem[] | null> {
    return this.endpoint.send('textDocument/prepareTypeHierarchy', params);
  }

  public diagnostics(params: DocumentDiagnosticParams): PromiseLike<DocumentDiagnosticReport | null> {
    return this.endpoint.send('textDocument/diagnostic', params);
  }

  // ocaml
  public ocamlTypedHoles(params: OcamlTypedHolesParams): PromiseLike<Range[] | null> {
    return this.endpoint.send('ocamllsp/typedHoles', params);
  }

  public ocamlHoverExtended(params: OcamlHoverExtendedParams): PromiseLike<Hover> {
    return this.endpoint.send('ocamllsp/hoverExtended', params);
  }

  public ocamlInferIntf(params: OcamlInferIntfParams): PromiseLike<OcamlInferIntfResponse | null> {
    return this.endpoint.send('ocamllsp/inferIntf', params);
  }

  public ocamlMerlinCallCompatible(params: OcamlMerlinCallCompatibleParams): PromiseLike<OcamlMerlinCallCompatibleResponse> {
    return this.endpoint.send('ocamllsp/merlinCallCompatible', params);
  }

  public ocamlTypeEnclosing(params: OcamlTypeEnclosingParams): PromiseLike<OcamlTypeEnclosingResponse> {
    return this.endpoint.send('ocamllsp/typeEnclosing', params);
  }
}
