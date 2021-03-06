lexer grammar Lexer;

Return: 'return';
Int: 'int';
If: 'if';
Else: 'else';
For: 'for';
While: 'while';
Do: 'do';
Break: 'break';
Continue: 'continue';

LeftParen: '(';
RightParen: ')';
LeftBrace: '{';
RightBrace: '}';
LeftBracket: '[';
RightBracket: ']';

Semi: ';';
Question: '?';
Colon: ':';
Comma: ',';

Plus: '+';
Minus: '-';
Mul: '*';
Div: '/';
Mod: '%';
Not: '!';
BitNot: '~';
And: '&&';
Or: '||';
Equal: '==';
NotEqual: '!=';
Less: '<';
LessEqual: '<=';
Greater: '>';
GreaterEqual: '>=';
Assign: '=';
Ref: '&';

Integer: [0-9]+;
Ident: [a-zA-Z_][0-9a-zA-Z_]*;

Whitespace: [ \t]+ -> skip;
Newline: ('\r' '\n'? | '\n') -> skip;
LineComment: '//' ~[\r\n]* -> skip;

Invalid: .;
