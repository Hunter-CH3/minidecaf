import { ParserRuleContext } from "antlr4ts";
import { AbstractParseTreeVisitor, TerminalNode } from "antlr4ts/tree";
import { MiniDecafVisitor } from "../gen/MiniDecafVisitor";
import MiniDecafParser = require("../gen/MiniDecafParser");
import { Ir } from "../ir";

/** 语法树到 IR 的生成器 */
export class IrGen extends AbstractParseTreeVisitor<void> implements MiniDecafVisitor<void> {
    ir: Ir = new Ir();

    defaultResult() {}

    visitProgram(ctx: MiniDecafParser.ProgramContext) {
        ctx.func().accept(this);
    }

    visitFunc(ctx: MiniDecafParser.FuncContext) {
        ctx.stmt().accept(this);
    }

    visitStmt(ctx: MiniDecafParser.StmtContext) {
        ctx.expr().accept(this);
        this.ir.emitReturn();
    }

    visitExpr(ctx: MiniDecafParser.ExprContext) {
        ctx.orExpr().accept(this);
    }

    visitOrExpr(ctx: MiniDecafParser.OrExprContext) {
        this.visitBinary(ctx);
    }

    visitAndExpr(ctx: MiniDecafParser.AndExprContext) {
        this.visitBinary(ctx);
    }

    visitEqualExpr(ctx: MiniDecafParser.EqualExprContext) {
        this.visitBinary(ctx);
    }

    visitRelExpr(ctx: MiniDecafParser.RelExprContext) {
        this.visitBinary(ctx);
    }

    visitAddExpr(ctx: MiniDecafParser.AddExprContext) {
        this.visitBinary(ctx);
    }

    visitMulExpr(ctx: MiniDecafParser.MulExprContext) {
        this.visitBinary(ctx);
    }

    visitIntExpr(ctx: MiniDecafParser.IntExprContext) {
        let int = parseInt(ctx.Integer().text);
        this.ir.emitImmediate(int);
    }

    visitUnaryExpr(ctx: MiniDecafParser.UnaryExprContext) {
        ctx.factor().accept(this);
        this.ir.emitUnary(ctx.getChild(0).text);
    }

    private visitBinary(ctx: ParserRuleContext) {
        if (ctx.childCount == 1) {
            ctx.getChild(0).accept(this);
        } else {
            let op = ctx.getChild(1);
            ctx.getChild(0).accept(this); // 计算左操作数，结果存在 `r0`
            this.ir.emitPush("r0"); // 将结果 `r0` 保存到栈顶
            ctx.getChild(2).accept(this); // 计算右操作数，结果存在 `r0`
            this.ir.emitPop("r1"); // 从栈顶弹出左操作数的结果到 `r1`
            this.ir.emitBinary(op.text); // 生成运算 `r1` op `r0`
        }
    }
}
