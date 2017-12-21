import React, { Component } from "react";
import { render } from "react-dom";

import Form from "react-jsonschema-form";
import Axios from "axios";
import Notifications, { notify } from 'react-notify-toast';

let forms = [], selectedForm = '';

const log = (type) => console.log.bind(console, type);
const apiUri = `${window.location.protocol}/${window.location.hostname}:${window.location.port}`;
const elementsMaterialistic = true;
const notification = notify.show || (() => { });

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

const postData = (uri, data, success = () => { }, error = err => { console.log(err) }) => {
    const config = {};
    Axios.post(uri, data, config).then(success).catch(error);
}

const getData = (uri, data, success = () => { }, error = err => { console.log(err) }) => {
    Axios.get(uri).then(success).catch(error);
}

const onFormChanged = (e) => {
}

const quasarJobSaved = (response) => {
    const job = response.data.job;
    const jobFile = response.data.jobFile.replace('.json');
    let runningJobHtml = `Job ${job} runnning...`;

    notification(runningJobHtml);

    const app = document.getElementById('app');
    app.classList.remove('isBusy');
    const jobWin = window.open(`/job/${job}`, job);
    jobWin.focus();
}

const showOutputWindow = () => {

}

const onFormSubmitted = (e) => {
    const app = document.getElementById('app');
    app.className += " isBusy";
    postData(window.location.origin, ensureData(e.formData), quasarJobSaved);
}

const createForms = () => {
    forms = window.quasarForms.map(form => form.name);
    window.quasarForms.forEach((schema) => {
        var form = document.createElement('div');
        var formTitle = schema.name;
        form.id = formTitle;
        form.style.display = 'none';
        form.className = "formContainer";

        render((
            <Form
                schema={schema.schema}
                uiSchema={schema.uiSchema}
                onChange={onFormChanged}
                onSubmit={onFormSubmitted}
                onError={log("errors")}>
                <p>
                    <button type="submit" class="btn btn-info">Generate ></button>
                </p>
            </Form>
        ), form);

        document.getElementById("app").appendChild(form);
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
        showForm(t.target.value);
    });

    outer.appendChild(dropdown);
    document.body.prepend(outer);
}

const showForm = (formTitle = null) => {
    let welcomeMessageDisplay = 'none';

    forms.forEach((form) => {
        const formEl = document.getElementById(form);
        if (form == formTitle) {
            selectedForm = form;
            formEl.style.display = "block";
        } else {
            formEl.style.display = "none";
        }
    });

    if (!formTitle) {
        welcomeMessageDisplay = "block";
        selectedForm = "";
    }

    if (elementsMaterialistic) {
        document.querySelector('.mdl-layout-title').innerHTML = selectedForm;
        document.getElementById('welcome').style.display = welcomeMessageDisplay;
    }
}

const finalTouches = () => {
    const file = document.querySelector('input[type=file]');
    file.setAttribute('accept', 'application/zip');
}

const getMaterialisticFormHeader = () => {
    let headerHtml = `<nav class="mdl-navigation">`;
    forms.forEach((form) => {
        headerHtml += `<a class="mdl-navigation__link" href="${form}">${form}</a>`;
    });
    return `${headerHtml}</nav>`;
}

const makeElementsMaterialistic = () => {
    const app = document.getElementById("app");
    const heading = document.getElementById("quasarHeading");
    const headerText = heading ? heading.innerHTML : "quasar";
    const materialisticContainer = document.createElement('div');
    materialisticContainer.id = "mdl";
    materialisticContainer.className = "mdl-layout mdl-js-layout mdl-layout--fixed-header";
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
            ${getMaterialisticFormHeader()}
        </div>
        <main class="mdl-layout__content">
            <div class="page-content mdl-grid"><div id="welcome" class="formContainer mdl-cell mdl-cell--8-col"><p>Welcome to the quasar build pipeline, where you can get a single html snippet from a series of different configurations.</p></div></div>
        </main>`;
    app.parentNode.insertBefore(materialisticContainer, app);

    if (heading) {
        heading.style.display = "none";
    }

    materialisticContainer.querySelectorAll('legend').forEach((legend) => {
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
    
    materialisticContainer.querySelectorAll('.mdl-layout-heading').forEach((appLink) => {
        appLink.addEventListener('click', function (e) {
            e.preventDefault();

            showForm();

            return false;
        });
    });

    materialisticContainer.querySelectorAll('.mdl-navigation__link').forEach((navLink) => {
        navLink.addEventListener('click', function (e) {
            e.preventDefault();

            var href = e.target.getAttribute('href');
            showForm(href);

            return false;
        });
    });

    // Close drawer hack
    materialisticContainer.querySelector('.mdl-layout__drawer').addEventListener('click', function () {
        materialisticContainer.querySelector('.mdl-layout__obfuscator').classList.remove('is-visible');
        this.classList.remove('is-visible');
    }, false);

    app.querySelectorAll('form').forEach((form) => {
        form.className += " mdl-cell mdl-cell--8-col";
    });
    app.querySelectorAll('button').forEach((button) => {
        button.className += " mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent";
    });
    app.querySelectorAll('input').forEach((input) => {
        if (input.getAttribute('type') == 'text') {
            input.className += " mdl-textfield__input";
            input.parentNode.className += " mdl-textfield mdl-js-textfield";
        }
    });

    const materialisticContainerInner = document.querySelector('#mdl .page-content');
    materialisticContainerInner.appendChild(app);

}

const createApp = () => {
    createForms();

    if (elementsMaterialistic) { makeElementsMaterialistic() }
    else { createDropdown() }

    createNotificationBar();
    finalTouches();
}

createApp();