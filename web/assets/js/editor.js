const EXAMPLE_CODE = `\
int main() {
    return 233;
}
`;

var codeCM;
var asmCM;
var outputCM;

function compileAndRun() {
  var input = codeCM.getValue();
  try {
    var asm = MiniDecaf.compile(input, {});
    asmCM.setValue(asm);
  } catch (err) {
    asmCM.setValue("");
    outputCM.setValue(err.message);
    return;
  }
  outputCM.setValue("0");
}

$(document).ready(function () {
  var extraKeys = {
    "Tab": function (cm) {
      if (cm.somethingSelected()) {
        cm.indentSelection("add");
      } else {
        cm.replaceSelection(cm.getOption("indentWithTabs") ? "\t" :
          Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");
      }
    }
  };

  codeCM = CodeMirror(document.getElementById("minidecaf-input"), {
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
    styleActiveLine: true,
    mode: "text/x-csrc",
    extraKeys,
  });

  asmCM = CodeMirror(document.getElementById("minidecaf-asm"), {
    lineNumbers: true,
    styleActiveLine: true,
    tabSize: 2,
    mode: { name: "gas", architecture: "riscv" },
    extraKeys,
  });

  outputCM = CodeMirror(document.getElementById("minidecaf-output"), {
    readOnly: true,
    mode: null,
  });

  codeCM.setValue(EXAMPLE_CODE);
  $("#btn-run").click(compileAndRun);
  compileAndRun();
});
