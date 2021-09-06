import React from 'react';
import {geoTransverseMercator, geoPath} from 'd3-geo';
import {select} from 'd3-selection';
import {transition} from 'd3-transition';
// import ToolTip from './ToolTip';

const Provincias = ({feature, geo, provs, setSelectionCallBack, clicked}) => {
	const pathRef = React.useRef();

	const handleMouseClick = e => {
		e.preventDefault();
		e.stopPropagation();
		console.log(feature.properties.np);
		setSelectionCallBack(feature.properties.np);
		clicked(e, pathRef.current, geo, provs);
	};

	return (
		<>
			<path id={feature.id} className='province child' d={geo.path(feature)} ref={pathRef} onClick={handleMouseClick} />
		</>
	);
};

const Localidades = ({feature, geo, setSelectionCallBack}) => {
	const deptoRef = React.useRef();

	const handleMouseClick = e => {
		e.preventDefault();
		e.stopPropagation();
		console.log(feature?.properties?.nd);
		setSelectionCallBack(feature?.properties?.nd);
	};

	const cloropeth = `rgba(0,250,255,${1 / feature?.properties?.nd?.length || 0.5})`;

	return <path style={{fill: cloropeth}} className='localidad' d={geo.path(feature)} ref={deptoRef} onClick={handleMouseClick} />;
};

export const Map = ({data: {dptos, provs}, width, height, setSelectionCallBack}) => {
	// let active = select(null); // sort of D3 "state"
	const [active, setActive] = React.useState(select(null));
	const svgRef = React.useRef();
	const gRef = React.useRef();
	const [geo, setGeo] = React.useState({path: null});

	function getGeoData(ref) {
		const svg = select(ref);
		const w = Number(svg.attr('width'));
		const h = Number(svg.attr('height'));

		const projection = geoTransverseMercator()
			.center([2.5, -38.5])
			.rotate([66, 0])
			.scale((h * 51) / 33) // (height*56.5)/33
			.translate([w / 2, h / 2]); // ..., height/2;

		const path = geoPath(projection);

		return {
			path,
			w,
			h
		};
	}

	function clicked(d, ref, geo, provs) {
		const {path, w, h} = geo;

		let index = el => {
			const filteredNode = provs.features.findIndex((node, i) => node?.id === el.id);
			return filteredNode;
		};

		let g = select(gRef.current);

		if (active.node() === ref) return reset(d, ref);
		active.style('fill', 'gray').classed('active', false);
		setActive(select(ref).classed('active', true));

		let idx = index(ref);

		let bounds = path.bounds(provs.features[idx]);

		let dx = bounds[1][0] - bounds[0][0];
		let dy = bounds[1][1] - bounds[0][1];
		let x = (bounds[0][0] + bounds[1][0]) / 2;
		let y = (bounds[0][1] + bounds[1][1]) / 2;
		let scale = 0.8 / Math.max(dx / w, dy / h);
		let translate = [w / 2 - scale * x, h / 2 - scale * y];

		g.transition()
			.duration(400)
			.style('stroke-width', 1.5 / scale + 'px')
			.attr('transform', 'translate(' + translate + ') scale(' + scale + ')')
			.on('end', function () {
				select(ref).style('fill', 'none');
			});
	}

	function reset(d, ref) {
		let g = select(ref.parentElement);
		active.classed('active', false);
		setActive(select(null));

		g.transition()
			.duration(600)
			.style('stroke-width', '1.5px')
			.attr('transform', '')
			.on('end', function () {
				ref.style('fill', 'gray');
			});
	}

	function handleCloseButton(e) {
		let child = select(active.node());
		let g = select(gRef.current);

		g.transition()
			.duration(600)
			.style('stroke-width', '1.5px')
			.attr('transform', '')
			.on('start', function () {
				child.style('fill', 'gray');
				active.classed('active', false);
				setActive(select(null));
			});
	}

	React.useEffect(() => {
		if (active) {
			setGeo(getGeoData(svgRef.current));
		}
	}, [active]);

	return (
		<>
			<div id='map-holder' style={{width, height}}>
				<svg id='close-button' onClick={e => handleCloseButton(e)} xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
				</svg>
				<svg ref={svgRef} width={width} height={height}>
					<rect className='background' width={width} height={height}></rect>
					{geo.path && (
						<g ref={gRef} className='parent'>
							{dptos?.features.map(feature => {
								return <Localidades key={feature.id} feature={feature} geo={geo} dptos={dptos} setSelectionCallBack={setSelectionCallBack} clicked={clicked} />;
							})}
							{provs?.features.map(feature => {
								return <Provincias key={feature.id} feature={feature} geo={geo} provs={provs} setSelectionCallBack={setSelectionCallBack} clicked={clicked} />;
							})}
						</g>
					)}
				</svg>
			</div>
		</>
	);
};
