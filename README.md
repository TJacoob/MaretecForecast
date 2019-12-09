# Responsive Maretec Forecast Visualization
This repository was done as part of my Computer Science and Engineering Masters at Instituto Superior Técnico titled: "Maretec Forecast Responsive Visualization". You can find the first half [in this repository](https://github.com/TJacoob/HDF5toJSON).

## Description
This repository is the visualization developed with the goal of displaying the Maretec Forecasts in a simple and responsive website. Much of what you see here was developed as part of another dissertation, therefore is not 100% my work. You can find most of my development in the following file:
```/maps/mapResultDisplay.html```.

The display developed uses Leaflet.js to load and parse a GeoJSON file with the forecasts. The magnitude details are loaded from magnitudes.json, where you can find some aspects such as color scale as well as minimum and maximum values for each magnitude. The visualization adapts to the information found on this file.
