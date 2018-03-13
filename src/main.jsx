import React from 'react';
import ReactDOM from 'react-dom';

import Ticker from './ui/utils/Ticker';
import Game from './ui/Game';
import Editor from './ui/Editor';
import Popup from './ui/Popup';
import {loadParams} from './params';
import {loadGameMetaData} from './ui/editor/DebugData';
import {editor as editor_style, fullscreen, center, bigButton} from './ui/styles';
import {extend} from 'lodash';

class Root extends React.Component {
    constructor(props) {
        super(props);
        const params = loadParams();
        this.state = { params };
        this.onHashChange = this.onHashChange.bind(this);
        if (params.editor) {
            loadGameMetaData();
        }
    }

    componentWillMount() {
        window.addEventListener('hashchange', this.onHashChange);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChange);
    }

    onHashChange() {
        this.setState({ params: loadParams() });
    }

    render() {
        let content;
        if (this.state.params.editor) {
            content = <Editor params={this.state.params} ticker={this.props.ticker} />;
        } else {
            content = <Game params={this.state.params} ticker={this.props.ticker} />;
        }
        return <div>
            {content}
            <Popup/>
        </div>
    }
}

window.onload = function() {
    init();
};

window.onerror = function(error) {
    init(error);
};

const bsod_style = extend({}, fullscreen, editor_style.base);
const centerVert = extend({}, center, {
    left: 0,
    right: 0,
    transform: 'translate(0, -50%)',
    textAlign: 'center'
});

function init(error) {
    const ticker = new Ticker();
    const reload = () => location.reload();
    const Renderer = () => error
        ? <div style={bsod_style}>
            <div style={centerVert}>
                <h1>Ooops! Something went wrong...</h1>
                <b>Error: </b>
                <i style={{color: 'red'}}>{error}</i>
                <hr style={{margin: '3em 6em'}}/>
                <button style={bigButton} onClick={diagnose.bind(null, error)}>Send diagnosis.</button>
                <button style={bigButton} onClick={reload}>Reload app!</button>
            </div>
        </div>
        : <Root ticker={ticker}/>;
    ReactDOM.render(<Renderer/>, document.getElementById('root'));
    ticker.run();
}

function diagnose(error) {
    
}

