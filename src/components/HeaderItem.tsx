import * as React from "react";

export interface HeaderItemProps {
    icon: React.ReactNode;
    tooltip: string;
    onClick: React.MouseEventHandler<any>;
}

export const HeaderItem: React.SFC<HeaderItemProps> = (props) => {

    const {icon, tooltip, onClick} = props;

    // if icon is a text, print a font-awesome <i/>, otherwise, consider it a React component and print it
    const iconElement = React.isValidElement(icon) ? icon : <i className={`fas fa-${icon}`} aria-hidden="true"/>;

    let buttonProps = {};

    if (tooltip) {
        buttonProps = {
            "aria-label": tooltip,
            "className": "tooltipped",
        };
    }

    return (
        <li className="mde-header-item">
            <button type="button" {...buttonProps} onClick={onClick}>
                {iconElement}
            </button>
        </li>
    );
};
