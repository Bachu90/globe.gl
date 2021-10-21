import "./App.css";
import Globe from "globe.gl";
import { useEffect, useRef, useState } from "react";
import earthNight from "./assets/earth-night.jpg";
import skyNight from "./assets/night-sky.png";
import * as turf from "@turf/turf";

function App() {
  const globeContainerRef = useRef(null);
  const globeRef = useRef(null);
  const [countries, setCountries] = useState(null);

  const handleButtonClick = p => {
    const center = turf.centerOfMass(p)
    const coords = {
      lat: center.geometry.coordinates[1],
      lng: center.geometry.coordinates[0],
      altitude: 0.7
    }
    globeRef.current
    .pointOfView(coords,[300])
    .polygonAltitude(d => d === p ? 0.12 : 0.06)
    .polygonCapColor(d => d === p ? 'steelblue' : '#ffffaa')
    .polygonLabel(
      ({ properties: d }) => `
        <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
        GDP: <i>${d.GDP_MD_EST}</i> M$<br/>
        Population: <i>${d.POP_EST}</i>
      `
    )
  }

  useEffect(() => {
    fetch("/countries.geojson")
      .then(res => res.json())
      .then(c => setCountries(c));
  }, []);

  useEffect(() => {
    if (!countries || globeRef.current !== null) return;
    globeRef.current = Globe()(globeContainerRef.current);
    globeRef.current
      .globeImageUrl(earthNight)
      .backgroundImageUrl(skyNight)
      .lineHoverPrecision(0)
      .polygonsData(
        countries.features?.filter(d => d.properties.ISO_A2 !== "AQ")
      )
      .polygonAltitude(0.06)
      .polygonSideColor(() => "rgba(0, 100, 0, 0.15)")
      .polygonStrokeColor(() => "#111")
      .polygonLabel(
        ({ properties: d }) => `
          <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
          GDP: <i>${d.GDP_MD_EST}</i> M$<br/>
          Population: <i>${d.POP_EST}</i>
        `
      )
      // .onPolygonHover(hoverD => globeRef.current
      //   .polygonAltitude(d => d === hoverD ? 0.12 : 0.06)
      //   .polygonCapColor(d => d === hoverD ? 'steelblue' : '#ffffaa')
      // )
      // .onPolygonClick(d => {
      //   console.log({d})
      // })
      .polygonsTransitionDuration(300);
  }, [countries]);

  return (
    <div className="App">
      <div className="globe" ref={globeContainerRef}></div>
      <div className="panel">
        {countries?.features?.map(c => (
          <button key={c.properties.NAME} onClick={() => handleButtonClick(c)}>{c.properties.NAME}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
