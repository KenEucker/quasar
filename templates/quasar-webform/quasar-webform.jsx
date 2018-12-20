import React, { Component } from "react";
import { render, findDOMNode } from "react-dom";

import Form from "react-jsonschema-form";
import Axios from "axios";
import Notifications, { notify } from "react-notify-toast";

const log = type => console.log.bind(console, type);
const notification = notify.show
  ? (message, type, data) => {
      log(message, data);
      notify.show(message, type);
    }
  : message => {
      log(message);
    };

const postData = (
  uri,
  data,
  success = () => {},
  error = err => {
    console.log(err);
  }
) => {
  const config = {};
  Axios.post(uri, data, config)
    .then(success)
    .catch(error);
};

const getData = (
  uri,
  data,
  success = () => {},
  error = err => {
    console.log(err);
  }
) => {
  Axios.get(uri)
    .then(success)
    .catch(error);
};

const quasarJobSaved = response => {
  const jobId = response.data.id;
  let runningJobHtml = `Job ${jobId} runnning...`;

  notification(runningJobHtml);
  const app = document.getElementById("app");
  app.classList.remove("isBusy");
  showOutputWindow(jobId);
};

const showOutputWindow = jobId => {
  const jobWin = window.open(`/job/${jobId}`, jobId);
  jobWin.focus();
};

const findAncestor = (el, tag, targetClass) => {
  tag = tag.toUpperCase();
  while (
    (el.parentNode &&
      (el = el.parentNode) &&
      el.tagName != tag) ||
    (targetClass && !el.classList.contains(targetClass))
  );
  return el;
};

const sanitizeInput = function() {
  const oldVal = this.value;
  this.value = sanitizeTextValue(oldVal);
  if (this.value != oldVal) {
    if (!this.parentNode.querySelector("span.notice")) {
      const message = document.createElement("span");
      message.className = "notice";
      message.style.color = "green";
      message.innerHTML = "value sanitized";
      this.parentNode.appendChild(message);
    }
    this.parentNode.classList.remove("is-invalid");
  }
};

const sanitizeTextValue = value => {
  return value
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
};

const downloadObjectAsJson = (exportObj, exportName) => {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute(
    "download",
    exportName + ".json"
  );
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

class QuasarWebform extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiUri: `${window.location.protocol}/${
        window.location.hostname
      }:${window.location.port}`,
      // TODO: fix this! We should only use selectors that exist with or without the additional UI wrappers
      elementsMaterialistic: true,
      canDragDropReceipt: true,
      forms: props.forms || [],
      formDefaultData: [],
      formNames: [],
      formRefs: [],
      outputTypeAssociations: [],
      selectedForm: "",
      container: null
    };

    this.state.forms.forEach(
      function(form) {
        const formName = form.name;
        this.state.formNames.push(formName);
        this.state.formDefaultData[formName] =
          form.formData;
        this.state.formRefs[formName] = React.createRef();
        this.state.outputTypeAssociations = this.state.outputTypeAssociations.concat(
          form.oTypes
        );
      }.bind(this)
    );
  }

  render() {
    return (
      <div>
        {this.state.forms.map(form => (
          <div
            id={form.name}
            className="formContainer hide"
            key={form.name}
          >
            <Form
              ref={this.state.formRefs[form.name]}
              schema={form.schema}
              uiSchema={form.uiSchema}
              formData={form.formData}
              onError={this.onFormErrors.bind(this)}
              onChange={this.onFormChanged.bind(this)}
              onSubmit={this.onFormSubmitted.bind(this)}
              validate={this.onFormValidate.bind(this)}
            >
              <p>
                <button
                  className="btn btn-info h-receipt-button"
                  onClick={this.onReceiptButtonClicked.bind(
                    this
                  )}
                >
                  ↓ Receipt
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                >
                  Build ↗
                </button>
              </p>
            </Form>
          </div>
        ))}
      </div>
    );
  }

  componentDidMount() {
    const afterRender = function() {
      const app = findDOMNode(this);

      if (!app) {
        return requestAnimationFrame(afterRender);
      }

      if (this.state.canDragDropReceipt) {
        this.enableDragAndDrop();
      }

      if (this.state.elementsMaterialistic) {
        this.makeElementsMaterialistic();
      } else {
        this.createDropdown();
      }

      this.createNotificationBar();

      this.hideOrShowAdditionalSettings();

      app
        .querySelectorAll(
          "label[for=root_askOptionalQuestions]"
        )
        .forEach(
          function(radio) {
            radio.parentNode
              .querySelectorAll("input")
              .forEach(
                function(field) {
                  const self = this;
                  field.addEventListener(
                    "click",
                    function() {
                      self.hideOrShowAdditionalSettings(
                        this.value == "true",
                        findAncestor(this, "form")
                      );
                    }
                  );
                }.bind(this)
              );
          }.bind(this)
        );

      app
        .querySelectorAll(
          ".formContainer fieldset > .form-group"
        )
        .forEach(fieldGroup => {
          const label =
            fieldGroup.querySelector("label") ||
            fieldGroup.querySelector("legend");
          if (label) {
            const fieldIsRequired = fieldGroup.querySelector(
              "span.required"
            );
            const fieldIconEl = document.createElement("i");
            fieldIconEl.className = `material-icons ${
              fieldIsRequired ? "required" : ""
            }`;

            label.insertBefore(
              fieldIconEl,
              label.childNodes[0]
            );
          } else {
            debugger;
          }
        });

      app
        .querySelectorAll("label[for=root_source]")
        .forEach(
          function(label) {
            label.querySelectorAll("i").forEach(
              function(icon) {
                icon.classList.add("clickable");
                icon.classList.add("active");
                icon.addEventListener(
                  "click",
                  function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    const field = this.changeSourceField(
                      null,
                      null,
                      null,
                      true
                    );
                  }.bind(this),
                  true
                );
              }.bind(this)
            );
          }.bind(this)
        );

      app.querySelectorAll("input").forEach(input => {
        if (input.required) {
          input.addEventListener("change", sanitizeInput);
        }
      });
    }.bind(this);

    afterRender();
  }

  onFormChanged(e) {}

  onFormSubmitted(e) {
    const app = document.getElementById("app");
    app.className += " isBusy";
    postData(
      window.location.origin,
      this.ensureData(e.formData),
      quasarJobSaved
    );
  }

  onFormValidate(formData, e) {
    return [];
  }

  ensureFormValueIsSetAndSanitized(data, key) {
    if (
      typeof data[key] != "undefined" &&
      data[key] != null &&
      data[key].length
    ) {
      data[key] = sanitizeTextValue(data[key]);
    }

    return data;
  }

  ensureData(data) {
    let allData = {};

    Object.keys(data).map(key => {
      let value = data[key];
      value =
        value === false
          ? false
          : value === true
          ? true
          : value || "";
      allData[key] = value;
    });
    allData.qType = this.state.selectedForm;
    const formEl = document.getElementById(
      this.state.selectedForm
    );
    const sourceEl = formEl.querySelector("#root_source");
    if (sourceEl.type == "text") {
      allData.source = sourceEl.value;
    }
    debugger;

    allData = this.ensureFormValueIsSetAndSanitized(
      allData,
      "domain"
    );
    allData = this.ensureFormValueIsSetAndSanitized(
      allData,
      "signature"
    );
    allData = this.ensureFormValueIsSetAndSanitized(
      allData,
      "client"
    );
    allData = this.ensureFormValueIsSetAndSanitized(
      allData,
      "campaign"
    );

    return allData;
  }

  getFormData(formTitle) {
    formTitle = formTitle || this.state.selectedForm;
    const formData = this.state.formRefs[formTitle].current
      .state.formData;

    // TODO: do this for all file input fields
    // Let's save only the filename in the file(s)
    var expR = new RegExp(/name=([^,]*);/);
    var expRResult = expR.exec(formData.source);
    if (expRResult) {
      formData.source = expRResult[1];
    }

    return this.ensureData(formData);
  }

  onFormErrors(e) {
    if (this.state.formError) {
      this.state.formError = false;
      return;
    }
    const form = document.getElementById(
      this.state.selectedForm
    );
    let allRequiredPresent = true;

    e.forEach(function(error) {
      const fieldName = error.property
        ? error.property.substr(1)
        : error.stack.split(":")[0];
      const field = form.querySelector(
        `#root_${fieldName}`
      );
      const isValid = field.checkValidity();

      if (isValid) {
        const parent = findAncestor(
          field,
          "div",
          "form-group"
        );
        parent.classList.remove("is-invalid");
        parent.classList.remove("field-error");
        parent.classList.remove("has-error");
        parent.classList.remove("has-danger");
      }
      allRequiredPresent = isValid && allRequiredPresent;
    });

    if (allRequiredPresent) {
      this.state.formError = true;
      this.state.formRefs[
        this.state.selectedForm
      ].current.setState({ formData: this.getFormData() });
      form.querySelector("button[type=submit]").click();
    } else {
      log("errors");
    }
  }

  getMaterialisticNavigationLinks(links) {
    let headerHtml = "";
    links.map(link => {
      headerHtml += `<a class="mdl-navigation__link" href="${
        link.href
      }" rel="${link.rel}">${link.title}</a>`;
    });

    return headerHtml;
  }

  makeElementsMaterialistic() {
    const app = document.getElementById("app");
    const heading = document.getElementById(
      "quasarHeading"
    );
    const headerText = heading
      ? heading.innerHTML
      : "quasar";
    const materialisticContainer = document.createElement(
      "div"
    );

    const self = this;
    const byQTypeNavLinks = this.state.formNames.map(
      form => {
        return { title: form, href: form, rel: form };
      }
    );
    const byOTypeNavLinks = [];
    this.state.outputTypeAssociations.map(oType => {
      if (oType.name !== oType.qType) {
        byOTypeNavLinks.push({
          title: `${oType.name} (${oType.qType})`,
          href: oType.qType,
          rel: oType.name
        });
      }
    });

    materialisticContainer.id = "mdl";
    materialisticContainer.className =
      "mdl-layout mdl-js-layout mdl-layout--fixed-header";
    materialisticContainer.innerHTML = `
			<header class="mdl-layout__header">
				<div class="mdl-layout__header-row">
					<span class="mdl-layout-title"></span>
					<div class="mdl-layout-spacer"></div>
					<span class="mdl-layout-heading">${headerText}</span>
				</div>
			</header>
			<div class="mdl-layout__drawer">
				<span class="mdl-layout-title">Quasar</span>
				<nav class="mdl-navigation">
					${this.getMaterialisticNavigationLinks(byQTypeNavLinks)}
					<span class="mdl-navigation__link" href="">By Output Type</span>
					${this.getMaterialisticNavigationLinks(byOTypeNavLinks)}
				</nav>
			</div>
			<main class="mdl-layout__content">
				<div class="page-content mdl-grid">
					<div id="welcome" class="formContainer mdl-cell mdl-cell--12-col"><p>Welcome to the quasar build pipeline, where you can get a single html snippet from a series of different configurations.</p></div>
				</div>
			</main>`;

    if (heading) {
      heading.classList.add("hide");
    }

    const materializeIcons = function(container) {
      container = container || document.body;

      container
        .querySelectorAll("select")
        .forEach(checkboxes => {
          if (checkboxes.childNodes[0].value == "") {
            checkboxes.childNodes[0].remove();
          }
        });

      container.querySelectorAll("i").forEach(iconEl => {
        if (!iconEl.classList.contains("material-icons")) {
          var className = iconEl.className;
          var iconName = className
            .replace("glyphicon-", "")
            .replace("glyphicon", "")
            .replace(" ", "");

          switch (iconName) {
            case "plus":
              iconName = "add";
              break;
            case "remove":
              iconName = "close";
              break;
            case "arrow-down":
              iconName = "arrow_drop_down";
              break;
            case "arrow-up":
              iconName = "arrow_drop_up";
              break;
          }
          iconEl.innerHTML = iconName;
          iconEl.classList.add("material-icons");
        }
      });
    };
    materializeIcons();

    document.body
      .querySelectorAll(".array-item-add button.btn-add")
      .forEach(buttonEl => {
        buttonEl.addEventListener(
          "click",
          function(evt) {
            var containerParent =
              evt.target.parentElement.parentElement
                .parentElement.parentElement;
            var select = containerParent.querySelector(
              "select"
            );
            const numChoicesOnField = containerParent.querySelectorAll(
              "select"
            ).length;
            let maxNumChoicesReached = false;
            if (select) {
              maxNumChoicesReached =
                numChoicesOnField >=
                select.querySelectorAll("option").length;
            }
            if (maxNumChoicesReached) {
              notification("max number of choices reached");
              evt.preventDefault();
              evt.stopPropagation();
              return;
            }

            requestAnimationFrame(function() {
              materializeIcons(containerParent);
            });
          },
          false
        );
      });

    materialisticContainer
      .querySelectorAll("legend")
      .forEach(legend => {
        const text = legend.innerHTML;
        legend.innerHTML = `<div class="row">
				<div class="col s12 m5">
				<div class="card-panel teal">
					<span>
						${text}
					</span>
				</div>
				</div>
			</div>`;
      });

    materialisticContainer
      .querySelectorAll(
        ".mdl-layout-heading, .mdl-layout-title .mdl-layout-title"
      )
      .forEach(appLink => {
        appLink.addEventListener("click", function(e) {
          e.preventDefault();
          self.showForm();

          return false;
        });
      });

    materialisticContainer
      .querySelectorAll("a.mdl-navigation__link")
      .forEach(navLink => {
        navLink.addEventListener("click", function(e) {
          e.preventDefault();
          var href = e.target.getAttribute("href");
          var rel = e.target.getAttribute("rel");
          if (href) {
            self.showForm(href, rel);
          }

          return false;
        });
      });

    // Close drawer hack
    materialisticContainer
      .querySelector(".mdl-layout__drawer")
      .addEventListener(
        "click",
        function() {
          materialisticContainer
            .querySelector(".mdl-layout__obfuscator")
            .classList.remove("is-visible");
          this.classList.remove("is-visible");
        },
        false
      );

    app.parentNode.insertBefore(
      materialisticContainer,
      app
    );

    app.querySelectorAll("form").forEach(form => {
      form.className += " mdl-cell mdl-cell--12-col";
      // form.childNodes[0].className = 'mdl-cell mdl-cell--2-col';
      form
        .querySelectorAll("fieldset > .form-group.field")
        .forEach(formGroup => {
          formGroup.className +=
            " mdl-cell mdl-cell--6-col mdl-cell--4-col-desktop";
        });
      form.querySelectorAll("input").forEach(input => {
        if (input.getAttribute("type") == "text") {
          input.className += " mdl-textfield__input";
          input.parentNode.className +=
            " mdl-textfield mdl-js-textfield";
        }
      });
    });
    app.querySelectorAll("button").forEach(button => {
      button.className +=
        " mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent";
    });

    const materialisticContainerInner = document.querySelector(
      "#mdl .page-content"
    );
    materialisticContainerInner.appendChild(app);
  }

  createNotificationBar() {
    let topBar = document.createElement("div");
    let div = document.createElement("div");
    topBar.className = "topBar";
    div.className = "notifications";
    render(<Notifications />, div);

    topBar.appendChild(div);
    document.body.prepend(topBar);
  }

  enableDragAndDrop() {
    const self = this;
    if (
      window.File &&
      window.FileReader &&
      window.FileList &&
      window.Blob
    ) {
      // Great success!
      function handleFileDrop(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files;
        if (files[0].type.match("application/json")) {
          handleJSONDrop(files);
        } else if (files[0].type.match("application/zip")) {
          handleZIPDrop(files);
        } else {
          notification(
            "dropped file is not supported",
            "error",
            files[0].type
          );
        }
      }

      const handleZIPDrop = function(files) {
        if (files[0].type.match("application/zip")) {
          if (self.state.selectedForm.length) {
            const fileInput = document
              .getElementById(self.state.selectedForm)
              .querySelector("#root_source");
            this.changeSourceField(files, fileInput);
          } else {
            notification(
              "no form selected to assign source to",
              "error"
            );
          }
        }
      }.bind(this);

      const handleJSONDrop = function(files) {
        if (files[0].type.match("application/json")) {
          // Loop through the FileList and read
          for (var i = 0, f; (f = files[i]); i++) {
            // Only process json files.
            if (!f.type.match("application/json")) {
              continue;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function(theFile) {
              return function(e) {
                var receipt = JSON.parse(e.target.result);
                console.log(
                  "quasar receipt dropped",
                  receipt,
                  theFile.name
                );
                receipt.id =
                  receipt.id ||
                  theFile.name.replace(".json", "");
                self.fillOutFormFromReceipt(receipt);
              }.bind(theFile);
            })(f);

            reader.readAsText(f);
          }
        }
      };

      const handleDragOver = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
      };

      // Setup the dnd listeners.
      var dropZone = document.getElementsByTagName(
        "body"
      )[0];
      dropZone.addEventListener(
        "dragover",
        handleDragOver,
        false
      );
      dropZone.addEventListener(
        "drop",
        handleFileDrop,
        false
      );
    } else {
      alert(
        "The File APIs are not fully supported in this browser."
      );
    }
  }

  createDropdown() {
    var outer = document.createElement("div");
    var dropdown = document.createElement("select");
    const selectOption = document.createElement("option");
    const self = this;

    outer.id = "quasarSelector";
    selectOption.text = "Quasar To Build";
    selectOption.value = false;
    selectOption.setAttribute("disabled", 1);
    selectOption.setAttribute("selected", 1);
    dropdown.add(selectOption);

    this.state.formNames.forEach(form => {
      let option = document.createElement("option");
      option.text = option.value = form;
      dropdown.add(option);
    });
    dropdown.addEventListener("change", t => {
      self.showForm(t.target.value);
    });

    outer.appendChild(dropdown);
    document.body.prepend(outer);
  }

  showForm(formTitle = null, selectOutputType = null) {
    this.state.formNames.forEach(form => {
      const formContainer = findDOMNode(
        this.state.formRefs[form].current
      ).parentElement;
      if (form == formTitle) {
        this.state.selectedForm = form;
        formContainer.classList.remove("hide");
        formContainer.classList.add("show");
      } else {
        formContainer.classList.remove("show");
        formContainer.classList.add("hide");
      }
    });

    if (this.state.elementsMaterialistic) {
      if (!formTitle) {
        document.querySelector(
          ".mdl-layout-title"
        ).innerHTML = "";
        const welcomeForm = document.getElementById(
          "welcome"
        );
        if (welcomeForm) {
          welcomeForm.classList.remove("hide");
          welcomeForm.classList.add("show");
        }
      } else {
        document.querySelector(
          ".mdl-layout-title"
        ).innerHTML = this.state.selectedForm;
        const welcomeForm = document.getElementById(
          "welcome"
        );
        if (welcomeForm) {
          welcomeForm.classList.remove("show");
          welcomeForm.classList.add("hide");
        }
      }
    }

    selectOutputType = selectOutputType || formTitle;
    selectOutputType =
      selectOutputType == "undefined"
        ? formTitle
        : selectOutputType;
    if (selectOutputType) {
      const formContainer = findDOMNode(
        this.state.formRefs[this.state.selectedForm].current
      ).parentElement;
      formContainer
        .querySelectorAll("label[for=root_oType]")
        .forEach(radio => {
          radio.parentNode
            .querySelectorAll("input")
            .forEach(field => {
              field.checked =
                field.value === selectOutputType;
            });
        });
    }
  }

  onReceiptButtonClicked(e) {
    e.preventDefault();
    this.getReceiptFromForm();
  }

  changeSourceField(val, field, form, forceToggle = false) {
    const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
    let changeToTextField =
      val !== null &&
      !(val instanceof FileList) &&
      val.match(urlRegex);
    let addClass = "inactive",
      removeClass = "active";

    if (!field) {
      if (form) {
        if (!(form instanceof HTMLElement)) {
          form = document.getElementById(form);
        }
      } else {
        form = document.getElementById(
          this.state.selectedForm
        );
      }

      field = form.querySelector("#root_source");
    }

    const fileVal =
      val instanceof FileList
        ? val
        : field.files || field.fileVal;
    const textVal = changeToTextField
      ? val
      : field.textVal || field.value;

    if (forceToggle) {
      changeToTextField = field.type === "file";
    }

    if (changeToTextField && field.type === "file") {
      field.fileVal = fileVal;
      field.type = "text";
      field.value = textVal;
    } else if (
      !changeToTextField &&
      field.type === "text"
    ) {
      field.textVal = textVal;
      field.type = "file";
      field.files = fileVal;
      addClass = "active";
      removeClass = "inactive";
    } else {
      if (field.type === "file") {
        field.files = fileVal;
      } else {
        field.value = textVal;
      }
    }

    const parent = findAncestor(field, "div", "form-group");
    parent.querySelectorAll("i").forEach(function(icon) {
      icon.classList.remove(removeClass);
      icon.classList.add(addClass);
    });
    parent
      .querySelectorAll(".file-info")
      .forEach(fileInfoEl => {
        if (addClass == "inactive") {
          fileInfoEl.classList.add("hide");
        }
        if (removeClass == "inactive") {
          fileInfoEl.classList.remove("hide");
        }
      });
  }

  fillOutFormFromReceipt(receipt, andShow = true) {
    try {
      let formTitle = receipt.qType || receipt.adType;

      // Save the day from previous qTypes and oTypes that have been deprecated
      if (!this.state.formRefs[formTitle]) {
        Object.keys(this.state.formRefs).forEach(function(
          formName
        ) {
          if (formName.indexOf(formTitle) !== -1) {
            formTitle = formName;
            receipt.qType = formName;
          } else if (formTitle.indexOf(formName) !== -1) {
            formTitle = formName;
            receipt.qType = formName;
          }
        });
      }

      const form = document.getElementById(formTitle);
      const formDefaultData = this.state.formDefaultData[
        formTitle
      ];
      const self = this;
      receipt = Object.assign({}, formDefaultData, receipt);

      this.state.formRefs[formTitle].current.setState({
        formData: receipt
      });

      if (form) {
        form.querySelectorAll("input").forEach(field => {
          if (field.required) {
            sanitizeInput.bind(field)();
          }
        });

        form
          .querySelectorAll(
            "label[for=root_askOptionalQuestions]"
          )
          .forEach(radio => {
            radio.parentNode
              .querySelectorAll("input")
              .forEach(field => {
                if (field.value === "true") {
                  self.hideOrShowAdditionalSettings(
                    field.checked,
                    form
                  );
                }
              });
          });

        this.changeSourceField(receipt.source, null, form);

        if (andShow) {
          this.showForm(formTitle, receipt.oType);
        }
      }
    } catch (e) {
      const errorTitle =
        "Receipt could not be loaded due to an error";
      console.log(errorTitle, e);
      notification(errorTitle);
    }
  }

  hideOrShowAdditionalSettings(
    show = false,
    target = null
  ) {
    target = target || document.getElementById("app");

    target
      .querySelectorAll(".field.optional")
      .forEach(field => {
        if (show) {
          field.classList.remove("hide");
          field.classList.add("show");
        } else {
          field.classList.remove("show");
          field.classList.add("hide");
        }
      });
  }

  getReceiptFromForm(form) {
    form = form || this.state.selectedForm;
    const receipt = this.getFormData(form);
    const filename =
      receipt.output && receipt.output.length
        ? receipt.output
        : form;
    downloadObjectAsJson(receipt, filename);
  }
}

render(
  <QuasarWebform forms={window.quasarForms} />,
  document.getElementById("app")
);
