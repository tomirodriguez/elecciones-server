import React from 'react';
import './App.css';
import DataViewer from './components/DataViewer';

import {Map} from './components/Map';
import {useData} from './hooks/useData';

const width = 600;
const height = 800;

const App = () => {
	const data = useData();
	const [selection, setSelection] = React.useState('02');

	const setSelectionCallBack = childState => {
		setSelection(childState);
	};

	return (
		<>
			{data ? <Map data={data} width={width} height={height} setSelectionCallBack={setSelectionCallBack} /> : <pre>Loading...</pre>}
			<DataViewer selection={selection} />
		</>
	);
};

export default App;
