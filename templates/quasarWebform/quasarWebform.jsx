import React, { Component } from "react";
import { render } from "react-dom";

import Form from "react-jsonschema-form";

let forms = [];

const log = (type) => console.log.bind(console, type);

const postData = (uri, data, success = null) => {
    return makeAsynCall(uri, success ? success : (res) => { console.log(`post to ${uri} successful`, res) }, 'POST', data);
}

const makeAsynCall = (uri, cb, method = 'GET', content = {}) => {
    return 
        fetch(uri, {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(content) })
        .then((response) => {
            console.log('hello');
            // TODO: More intelligence here around the response
            cb(response);
        });
}

const onFormSubmitted = (e) => {
    postData(`${window.location}`, e.formData);
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
                onChange={log("changed")}
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
                formEl.style.display = "block";
            } else {
                formEl.style.display = "none";
            }
        });
    });

    outer.appendChild(dropdown);
    document.body.prepend(outer);
}

createForms();
createDropdown();
