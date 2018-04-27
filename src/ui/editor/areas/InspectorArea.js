import {findIndex} from 'lodash';
import {InspectorContent} from './InspectorArea/content';

const InspectorArea = {
    id: 'inspector',
    name: 'Inspector',
    icon: 'terminal.png',
    content: InspectorContent,
    getInitialState: () => ({
        path: [],
        watches: [],
        tab: 'explore'
    }),
    stateHandler: {
        setTab(tab) {
            this.setState({tab});
        },
        setPath(path) {
            this.setState({path});
        },
        addWatch(path, params) {
            const watches = this.state.watches || [];
            const id = new Date().getTime();
            watches.push({
                id,
                path,
                params
            });
            this.setState({watches});
        },
        removeWatch(id) {
            const watches = this.state.watches || [];
            const idx = findIndex(watches, w => w.id === id);
            if (idx !== -1) {
                watches.splice(idx, 1);
            }
            this.setState({watches});
        }
    }
};

export default InspectorArea;
