import React, { Component } from "react";
import { render } from "react-dom";

import Form from "react-jsonschema-form";
import Axios from "axios";
import Notifications, {notify} from 'react-notify-toast';

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

const createNotificationBar = () => {
    let topBar = document.createElement('div');
    let div = document.createElement('div');
    topBar.className = 'topBar';
    div.className = 'notifications';
    render(<Notifications />, div);

    topBar.appendChild(div);
    document.body.prepend(topBar);
}

const postData = (uri, data, success = () => {}, error = err => { console.log(err) }) => {
    const config = {};
    Axios.post(uri, data, config).then(success).catch(error);
}

const getData = (uri, data, success = () => {}, error = err => { console.log(err) }) => {
    Axios.get(uri).then(success).catch(error);
}

const onFormChanged = (e) => {
}

const quasarJobSaved = (response) => {
    notify.show(`Job ${response.data.jobFile} runnning...`);
}

const onFormSubmitted = (e) => {
    postData(window.location.origin, ensureData(e.formData), quasarJobSaved);
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
        notify.show(`Changing to form ${t.target.value}`);
    
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
createNotificationBar();
finalTouches();