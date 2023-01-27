import {useState} from "react";

function Input(props){



    let inputElement = () => {
        if (props.element === 'input'){
            return <input id={props.id} type={props.type} value={props.value} onChange={props.changeFun} />;
        }
        else if (props.element === 'textarea'){
            return <textarea id={props.id} rows='4' value={props.value} onChange={props.changeFunc} />;
        }
    }

    let elem = inputElement();
    

    return (
        <div>
            <label id={props.labelid}>{props.label}</label>
            {elem}
        </div>
    )

}

export default Input