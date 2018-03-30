import React from 'react';
import {extend, map} from 'lodash';

import TextBox from './TextBox';

const styleHUD = {
    border: '1px outset rgba(44, 74, 95, 0.5)',
    background: 'rgba(44, 74, 95, 0.5)',
    borderRadius: 15,
    position: 'absolute',
    top: 15,
    left: 15,
    verticalAlign: 'middle',
    textAlign: 'center',
    padding: '5px'
};

export default class GameHUD extends React.Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.state = { selectedIndex: 0 };
    }

    componentWillMount() {
    }

    componentWillReceiveProps(newProps) {
    }

    componentWillUnmount() {
    }

    update() { }

    render() {
        return <div style={styleHUD}>
            <Heart />
            <Magic />
            <CloverBox />
        </div>;
    }
}

const styleHearth = {
    border: '1px outset #ff0000',
    borderRadius: 15,
    fontSize: '3em',
    textAlign: 'center',
    width: 200,
    height: 15,
    background: 'rgba(255, 0, 0, 0.5)',
    float: 'right',
    verticalAlign: 'middle'
};

function Heart(props) {
    return <div>
        <img src="/hud/3_hearth.png" style={{ width: 18, height: 18}}/>
        <div style={styleHearth} />
    </div>;
}

const styleMagic = {
    border: '1px outset #20a2ff',
    borderRadius: 15,
    fontSize: '3em',
    textAlign: 'center',
    width: 200,
    height: 15,
    background: 'rgba(32, 162, 255, 0.5)',
    float: 'right',
    verticalAlign: 'middle'
};

function Magic(props) {
    return <div>
        <img src="/hud/4_magic.png" style={{ width: 18, height: 18 }}/>
        <div style={styleMagic} />
    </div>;
}

function CloverBox(props) {
    return <div>
        <img src="/hud/0_clover_box.png" style={{ width: 18, height: 18, float: 'left' }}/>
        <img src="/hud/0_clover_box.png" style={{ width: 18, height: 18, float: 'left' }}/>
        <img src="/hud/0_clover_box.png" style={{ width: 18, height: 18, float: 'left' }}/>
    </div>;
}
