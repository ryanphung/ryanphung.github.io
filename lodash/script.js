const saveToLocalStorage = (editorName, editor) => {
  localStorage.setItem(`json_editor_${editorName}`, editor.getValue());
};

const loadFromLocalStorage = (editorName, editor) => {
  const value = localStorage.getItem(`json_editor_${editorName}`);
  if (value) {
    editor.setValue(value);
  }
};

const formatText = (spacing = 0) => {
  try {
    // const current = JSON.parse(editor.getValue());
    const current = eval(`(${editor.getValue()})`);
    editor.setValue(JSON.stringify(current, null, spacing));
    editor.focus();
    editor.selectAll();
    document.execCommand("copy");
  } catch (err) {
    alert("ERROR: Unable to parse text as JSON");
  }
};

const filterText = () => {
  try {
    const editorValue = editor.getValue();
    if (!editorValue.length) {
      result.setValue("");
      return;
    }

    const current = JSON.parse(editorValue);

    const expression = paths.getValue();
    if (!expression.length) {
      result.setValue("");
      return;
    }

    const fullExpression = `
      const data = ${JSON.stringify(current)};
      ${expression}
    `;
    const filtered = eval(fullExpression);
    result.setValue(JSON.stringify(filtered, null, 2));
  } catch (err) {
    result.setValue(err.message);
  }
};

const editor = ace.edit("editor", {
  mode: "ace/mode/json",
  selectionStyle: "text",
  showPrintMargin: false,
  theme: "ace/theme/chrome",
  tabSize: 2,
  useSoftTabs: true,
});

const paths = ace.edit("paths", {
  mode: "ace/mode/text",
  selectionStyle: "text",
  showPrintMargin: false,
  theme: "ace/theme/chrome",
  tabSize: 2,
  useSoftTabs: true,
});

const result = ace.edit("result", {
  mode: "ace/mode/json",
  selectionStyle: "text",
  showPrintMargin: false,
  theme: "ace/theme/chrome",
  readOnly: true,
  tabSize: 2,
  useSoftTabs: true,
});

loadFromLocalStorage("editor", editor);
loadFromLocalStorage("paths", paths);
filterText();

editor.on("paste", (event) => {
  try {
    event.text = JSON.stringify(JSON.parse(event.text), null, 2);
  } catch (err) {
    // meh
  }
});

editor.on("change", filterText);

paths.on("change", filterText);

editor.on("change", () => {
  saveToLocalStorage("editor", editor);
});

paths.on("change", () => {
  saveToLocalStorage("paths", paths);
});

// disable the auto selection of the result
result.getSession().selection.on("changeSelection", function (e) {
  result.getSession().selection.clearSelection();
});

document.getElementById("minify").addEventListener("click", () => formatText());
document
  .getElementById("beautify")
  .addEventListener("click", () => formatText(2));
