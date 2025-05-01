"use client";

import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { MapPin, ExternalLink } from "lucide-react";
import "./map.css";
import "mapbox-gl/dist/mapbox-gl.css";

const MapPage = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(68.0); // Center of Kazakhstan
  const [lat, setLat] = useState(48.0);
  const [zoom, setZoom] = useState(4);
  const [vacancies, setVacancies] = useState([]);
  const [popupState, setPopupState] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapboxglInstance, setMapboxglInstance] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !mapboxglInstance) {
      import("mapbox-gl").then((mapbox) => {
        mapbox.default.accessToken =
          "pk.eyJ1IjoiZGRkZGRkYW55YSIsImEiOiJjbHZpMG5xMjIwajNzMnZxb2FrbW1wMnh4In0.HCL8keo5WFgvJw5UcyY_9Q";
        setMapboxglInstance(mapbox.default);
        console.log("Mapbox-gl loaded successfully");
      });
    }
  }, [mapboxglInstance]);

  useEffect(() => {
    async function fetchVacancies() {
      if (!mapboxglInstance) return;

      try {
        const response = await axios.get("https://api.hh.ru/vacancies", {
          params: {
            per_page: 100,
            area: 40, // Kazakhstan
          },
        });

        const vacanciesData = response.data.items;
        console.log(`Fetched ${vacanciesData.length} vacancies for Kazakhstan`);

        const filteredVacancies = vacanciesData
          .filter((vacancy) => {
            return (
              vacancy.address &&
              typeof vacancy.address.lat === "number" &&
              typeof vacancy.address.lng === "number" &&
              vacancy.address.lng >= 44.9 &&
              vacancy.address.lng <= 87.8 &&
              vacancy.address.lat >= 41.0 &&
              vacancy.address.lat <= 55.0
            );
          })
          .map((vacancy) => ({
            ...vacancy,
            coordinates: [vacancy.address.lng, vacancy.address.lat],
          }));

        setVacancies(filteredVacancies);
        console.log(
          `Found ${filteredVacancies.length} vacancies with valid coordinates in Kazakhstan`
        );
      } catch (error) {
        console.error("Error fetching vacancies:", error);
      }
    }

    fetchVacancies();
  }, [mapboxglInstance]);

  useEffect(() => {
    if (!mapboxglInstance || map.current || !mapContainer.current) return;

    console.log("Initializing map...");

    map.current = new mapboxglInstance.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom: zoom,
      pitch: 0,
      bearing: 0,
    });

    map.current.on("load", () => {
      setIsMapLoaded(true);
      console.log("Map loaded successfully");

      vacancies.forEach((vacancy) => {
        const coordinates = vacancy.coordinates;
        console.log(
          `Adding marker for vacancy ${vacancy.id} at coordinates: [${coordinates[0]}, ${coordinates[1]}]`
        );

        const el = document.createElement("div");
        el.className = "vacancy-marker";
        el.addEventListener("click", () => {
          setSelectedVacancy(vacancy);
          setPopupState(true);
        });

        new mapboxglInstance.Marker(el)
          .setLngLat(coordinates)
          .addTo(map.current);
      });

      map.current.easeTo({
        center: [lng, lat],
        zoom: zoom,
        duration: 5000,
        easing: (t) => t,
        essential: true,
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxglInstance, vacancies, lng, lat, zoom]);

  const handleClosePopup = () => {
    setPopupState(false);
    setSelectedVacancy(null);
  };

  const formatSalary = (salary) => {
    if (!salary) return "Не указана";
    const from = salary?.from ? `${salary.from}` : "";
    const to = salary?.to ? `${salary.to}` : "";
    const currency = salary?.currency || "";
    return `${from}${from && to ? " - " : ""}${to} ${currency}`.trim();
  };

  // Parse HTML list items and render with MapPin icons
  const renderListWithPins = (html) => {
    if (!html) return <p>Описание отсутствует</p>;

    // Simple parsing to extract <li> content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const listItems = Array.from(doc.querySelectorAll("li")).map(
      (li) => li.textContent
    );

    if (listItems.length === 0) {
      return <p>{html}</p>;
    }

    return (
      <ul className="pin-list">
        {listItems.map((item, index) => (
          <li key={index} className="pin-list-item">
            <MapPin className="pin-icon" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Карта вакансий</h1>
        <p>Исследуйте вакансии на карте</p>
      </div>
      <div ref={mapContainer} className="map-container"></div>
      {!isMapLoaded && (
        <div className="map-loading">
          <p>Загрузка карты...</p>
        </div>
      )}
      {popupState && selectedVacancy && (
        <div className="popup">
          <div className="popup-content">
            <button className="popup-close" onClick={handleClosePopup}>
              ×
            </button>
            <h2 className="popup-title">{selectedVacancy.name}</h2>
            <div className="popup-section">
              <h3>Компания</h3>
              <p>{selectedVacancy.employer?.name || "Не указано"}</p>
            </div>
            <div className="popup-section">
              <h3>Местоположение</h3>
              <p>{selectedVacancy.area?.name || "Не указано"}</p>
            </div>
            <div className="popup-section">
              <h3>Зарплата</h3>
              <p>{formatSalary(selectedVacancy.salary)}</p>
            </div>
            <div className="popup-section">
              <h3>Требования</h3>
              {renderListWithPins(selectedVacancy.snippet?.requirement)}
            </div>
            <div className="popup-section">
              <h3>Обязанности</h3>
              {renderListWithPins(selectedVacancy.snippet?.responsibility)}
            </div>
            <a
              href={selectedVacancy.alternate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="popup-apply-button"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Откликнуться
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;