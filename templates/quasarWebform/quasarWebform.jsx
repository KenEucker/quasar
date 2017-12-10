import React, { Component } from "react";
import { render } from "react-dom";

import Form from "react-jsonschema-form";
import Axios from "axios";

let forms = [], selectedForm = '';

const log = (type) => console.log.bind(console, type);
const apiUri = `${window.location.protocol}/${window.location.hostname}:${window.location.port}`;

const ensureData = (data) => {
    let allData = {};

    Object.keys(data).map((key) => {
        allData[key] = data[key] || '';
    });
    allData.qType = selectedForm;

    return allData;
}

const postData = (uri, data, success = () => {}, error = err => { console.log(err) }) => {
    const config = {}; //{ headers: { 'Content-Type': 'multipart/form-data' } };
    // if (document.querySelector('input[type=file]').files.length) {
    //     data.file = document.querySelector('input[type=file]').files[0];
    // }
    Axios.post(uri, data, config).then(success).catch(error);
}

const getData = (uri, data, success = () => {}, error = err => { console.log(err) }) => {
    Axios.get(uri).then(success).catch(error);
}

const onFormChanged = (e) => {
    const formData = e.formData;

    if(formData.source) {
        console.log(formData.source);
    }
}

const onFormSubmitted = (e) => {
    postData(window.location.origin, ensureData(e.formData));
}

const createForms = () => {
    window.quasarForms.forEach((form) => {
        var div = document.createElement('div');
        var formTitle = form.name;
        div.id = formTitle;
        div.style.display = 'none';
        forms.push(formTitle);

        render((
            <Form 
                schema={form.schema}
                uiSchema={form.uiSchema}
                onChange={onFormChanged}
                onSubmit={onFormSubmitted}
                onError={log("errors")}>
                    <p>
                        <button type="submit" class="btn btn-info">Generate</button>
                    </p>
                </Form>
        ), div);

        document.getElementById("app").appendChild(div);
    });
}

const createDropdown = () => {
    var outer = document.createElement('div');
    var dropdown = document.createElement('select');
    const selectOption = document.createElement("option");

    outer.id = "quasarSelector";
    selectOption.text = "Quasar To Build";
    selectOption.value = false;
    selectOption.setAttribute("disabled", 1);
    selectOption.setAttribute("selected", 1);
    dropdown.add(selectOption);

    forms.forEach((form) => {
        let option = document.createElement("option");
        option.text = option.value = form;
        dropdown.add(option);
    });
    dropdown.addEventListener("change", (t) => {
        forms.forEach((form) => {
            const formEl = document.getElementById(form);
            if(form == t.target.value) {
                selectedForm = form;
                formEl.style.display = "block";
            } else {
                formEl.style.display = "none";
            }
        });
    });

    outer.appendChild(dropdown);
    document.body.prepend(outer);
}

const finalTouches = () => {
    const file = document.querySelector('input[type=file]');
    file.setAttribute('accept', 'application/zip');
}

createForms();
createDropdown();
finalTouches();