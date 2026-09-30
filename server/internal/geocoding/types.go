package geocoding

// Point is a geographic origin in decimal degrees.
type Point struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// Result is the first Google Geocoding result selected for an address.
type Result struct {
	FormattedAddress string `json:"formattedAddress"`
	Location         Point  `json:"location"`
}
