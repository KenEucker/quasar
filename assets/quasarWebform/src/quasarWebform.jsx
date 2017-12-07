import React, { Component } from "react";
import { render } from "react-dom";

import Form from "react-jsonschema-form";

const log = (type) => console.log.bind(console, type);

window.quasarForms.forEach((form) => {
    var div = document.createElement('div');
    var formTitle = form.name;
    div.id = formTitle;

    render((
        <Form 
            schema={form.schema}
            uiSchema={form.uiSchema}
            onChange={log("changed")}
            onSubmit={log("submitted")}
            onError={log("errors")} />
    ), div);

    document.getElementById("app").appendChild(div);
});