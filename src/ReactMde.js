import React, { Component } from 'react';
import ReactMdeCommands from './ReactMdeCommands';
import showdown from 'showdown';

/**
 * Gets the selection of the given element
 * 
 * @param {any} element
 * @returns
 */
function getSelection(element) {
    if (!element) throw Error('Argument \'element\' should be truthy');
    return [element.selectionStart, element.selectionEnd]
}

/**
 * Sets the selection of the given element
 * 
 * @param {any} element
 * @param {any} start
 * @param {any} end
 */
function setSelection(element, start, end) {
    if (!element) throw Error('Argument \'element\' should be truthy');

    element.focus();
    if (!element.setSelectionRange)
        throw Error('Incompatible browser. element.setSelectionRange is not defined');
    element.setSelectionRange(start, end);
}

const HeaderGroup = (props) => (
    <ul className="mde-header-group">
        {props.children}
    </ul>
);

const HeaderItem = ({icon, onClick, tooltip}) => {

    // if icon is a text, print a font-awesome <i/>, otherwise, consider it a React component and print it
    var iconElement = React.isValidElement(icon) ? icon : <i className={`fa fa-${icon}`} aria-hidden="true"></i>

    let buttonProps = {};
    if (tooltip) {
        buttonProps = {
            'aria-label': tooltip,
            className: 'tooltipped'
        }
    }
    return (
        <li className="mde-header-item">
            <button type="button" {...buttonProps} onClick={onClick}>
                {iconElement}
            </button>
        </li>
    );
}

const MarkdownHelp = ({helpText = 'Markdown styling is supported', markdownReferenceUrl = 'http://commonmark.org/help/'}) => {
    return <a className="markdown-help" href={markdownReferenceUrl} target="_blank">
        <svg aria-hidden="true" className="markdown-help-svg" height="16" version="1.1" viewBox="0 0 16 16" width="16">
            <path fillRule="evenodd" d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z">
            </path>
        </svg>
        <span className="markdown-help-text">{helpText}</span>
    </a>;
}

class ReactMde extends Component {

    static propTypes = {
        commands: React.PropTypes.array
    }

    /**
     *
     */
    constructor() {
        super();
        this.converter = new showdown.Converter();
    }


    handleValueChange(e) {
        let {
            value: { text, selection },
            onChange
        } = this.props;
        onChange({ text: e.target.value, selection: null });
    }

    /**
     * Handles the execution of a command
     * @param {function} command
     * @memberOf ReactMde
     */
    getCommandHandler(commandFunction) {
        return function () {
            let {
                value: { text, selection },
                onChange
            } = this.props;
            let textarea = this.refs.textarea;

            var newValue = commandFunction(text, getSelection(textarea));

            // let's select EVERYTHING and replace with the result of the command.
            // This will cause an 'inconvenience' which is: Ctrl + Z will select the whole
            // text. But this is the LEAST possible inconvenience. We can pretty much live
            // with it. I've tried everything in my reach, including reimplementing the textarea
            // history. That caused more problems than it solved.

            this.refs.textarea.focus();
            setSelection(this.refs.textarea, 0, this.refs.textarea.value.length);
            document.execCommand("insertText", false, newValue.text);

            setSelection(this.refs.textarea, newValue.selection[0], newValue.selection[1]);
        }
    }

    render() {

        let {
            value: { text, selection },
            onChange,
            commands
        } = this.props;

        let html = this.converter.makeHtml(text) || '<p>&nbsp</p>';

        let header = null;
        if (commands) {
            header = <div className="mde-header">
                {
                    commands.map((cg, i) => {
                        return <HeaderGroup key={i}>
                            {
                                cg.map((c, j) => {
                                    return <HeaderItem key={j} icon={c.icon} tooltip={c.tooltip} onClick={this.getCommandHandler(c.execute).bind(this)} />
                                })
                            }
                        </HeaderGroup>
                    })
                }
            </div>
        }

        return (
            <div className="react-mde">
                {header}
                <div className="mde-text">
                    <textarea onChange={this.handleValueChange.bind(this)} value={text} ref="textarea" />
                </div>
                <div className="mde-preview" dangerouslySetInnerHTML={{ __html: html }}>
                </div>
                <div className="mde-help">
                    <MarkdownHelp />
                </div>
            </div>
        );
    }
}

export default ReactMde;
