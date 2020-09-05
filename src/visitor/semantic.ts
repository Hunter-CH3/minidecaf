import { AbstractParseTreeVisitor } from "antlr4ts/tree";
import MiniDecafParser = require("../gen/MiniDecafParser");
import { MiniDecafVisitor } from "../gen/MiniDecafVisitor";
import { SemanticError } from "../error";
import { Type, Variable } from "../type";
import { Scope } from "../scope";

/** 支持的最大整数 */
const MAX_UINT = 0xffff_ffff;

/** 语义检查器 */
export class SemanticCheck extends AbstractParseTreeVisitor<void>
    implements MiniDecafVisitor<void> {
    /** main 函数的作用域 */
    private scope: Scope = new Scope();

    defaultResult() {}

    visitFunc(ctx: MiniDecafParser.FuncContext) {
        ctx.blockItem().forEach((item) => item.accept(this));
        ctx["localVarSize"] = this.scope.localVarSize;
    }

    visitDecl(ctx: MiniDecafParser.DeclContext) {
        let name = ctx.Ident().text;
        if (!this.scope.find(name)) {
            let type = ctx.Int().text as Type;
            ctx.expr()?.accept(this);
            ctx["variable"] = this.scope.declareVar(name, type);
        } else {
            throw new SemanticError(ctx.Ident().symbol, `symbol '${name}' is already declared`);
        }
    }

    visitAssignExpr(ctx: MiniDecafParser.AssignExprContext) {
        let name = ctx.Ident().text;
        let v = this.scope.find(name);
        if (v instanceof Variable) {
            ctx["variable"] = v;
            ctx.expr().accept(this);
        } else {
            throw new SemanticError(ctx.Ident().symbol, `variable '${name}' is not declared`);
        }
    }

    visitIntExpr(ctx: MiniDecafParser.IntExprContext) {
        let int = parseInt(ctx.Integer().text);
        ctx["integer"] = int;
        if (int > MAX_UINT) {
            throw new SemanticError(ctx.Integer().symbol, `integer '${int}' is too large`);
        }
    }

    visitIdentExpr(ctx: MiniDecafParser.IdentExprContext) {
        let name = ctx.Ident().text;
        let v = this.scope.find(name);
        if (v instanceof Variable) {
            ctx["variable"] = v;
        } else {
            throw new SemanticError(ctx.Ident().symbol, `variable '${name}' is not declared`);
        }
    }
}
