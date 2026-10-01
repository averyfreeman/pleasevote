package httpapi

import "net/http"

func (h *handler) writeOpenAPI(responseWriter http.ResponseWriter) {
	jsonResponse := func(description string) map[string]any {
		return map[string]any{"200": map[string]any{"description": description}}
	}
	document := map[string]any{
		"openapi": "3.1.0",
		"info": map[string]any{
			"title":       "PleaseVote provider boundary",
			"version":     "v1",
			"description": "Credential-free voter information assembled from Google Civic Information API and Google Geocoding.",
		},
		"paths": map[string]any{
			"/api/v1/elections":          map[string]any{"get": map[string]any{"operationId": "listElections", "responses": jsonResponse("Available election metadata.")}},
			"/api/v1/lookup":             map[string]any{"get": map[string]any{"operationId": "lookupVoterInformation", "responses": jsonResponse("Frontend-facing voter information.")}},
			"/api/v1/discovery":          map[string]any{"get": map[string]any{"operationId": "discoverAlternatePlace", "responses": jsonResponse("Alternate-place information with an eligibility warning.")}},
			"/api/v1/divisions":          map[string]any{"get": map[string]any{"operationId": "searchDivisions", "responses": jsonResponse("Official Civic division search results.")}},
			"/api/v1/divisionsByAddress": map[string]any{"get": map[string]any{"operationId": "divisionsByAddress", "responses": jsonResponse("Official Civic divisions for an address.")}},
			"/api/docs":                  map[string]any{"get": map[string]any{"operationId": "humanApiDocs", "responses": jsonResponse("Human-readable API documentation.")}},
			"/healthz":                   map[string]any{"get": map[string]any{"operationId": "health", "responses": jsonResponse("The process is ready.")}},
		},
		"components": map[string]any{
			"schemas": map[string]any{
				"LookupResponse": map[string]any{
					"type":     "object",
					"required": []string{"address", "normalizedAddress", "origin", "election", "mode", "pollingLocations", "earlyVoteSites", "dropOffLocations", "contests", "administration", "otherElections", "sources", "retrieval"},
					"properties": map[string]any{
						"address":           map[string]string{"type": "string"},
						"normalizedAddress": map[string]any{"$ref": "#/components/schemas/Address"},
						"origin":            map[string]any{"$ref": "#/components/schemas/Point"},
						"election":          map[string]any{"$ref": "#/components/schemas/Election"},
						"mode":              map[string]any{"type": "string", "enum": []string{"live", "test-fixture"}},
						"warning":           map[string]string{"type": "string"},
						"pollingLocations":  map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/PollingLocation"}},
						"earlyVoteSites":    map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/PollingLocation"}},
						"dropOffLocations":  map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/PollingLocation"}},
						"contests":          map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/Contest"}},
						"administration":    map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/Administration"}},
						"otherElections":    map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/Election"}},
						"sources":           map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/Source"}},
						"mailOnly":          map[string]string{"type": "boolean"},
						"retrieval":         map[string]any{"$ref": "#/components/schemas/Retrieval"},
					},
				},
				"ElectionsResponse": map[string]any{
					"type":     "object",
					"required": []string{"elections", "retrieval"},
					"properties": map[string]any{
						"elections": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/Election"}},
						"retrieval": map[string]any{"$ref": "#/components/schemas/Retrieval"},
					},
				},
				"Division": map[string]any{
					"type":     "object",
					"required": []string{"ocdId", "name"},
					"properties": map[string]any{
						"ocdId":       map[string]string{"type": "string"},
						"name":        map[string]string{"type": "string"},
						"aliases":     map[string]any{"type": "array", "items": map[string]string{"type": "string"}},
						"alsoKnownAs": map[string]any{"type": "array", "items": map[string]string{"type": "string"}},
					},
				},
				"AddressDivision": map[string]any{
					"type":     "object",
					"required": []string{"name"},
					"properties": map[string]any{
						"name":        map[string]string{"type": "string"},
						"alsoKnownAs": map[string]any{"type": "array", "items": map[string]string{"type": "string"}},
					},
				},
				"DivisionsResponse": map[string]any{
					"type":     "object",
					"required": []string{"results", "retrieval"},
					"properties": map[string]any{
						"results":   map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/Division"}},
						"kind":      map[string]string{"type": "string"},
						"retrieval": map[string]any{"$ref": "#/components/schemas/Retrieval"},
					},
				},
				"DivisionsByAddressResponse": map[string]any{
					"type":     "object",
					"required": []string{"divisions", "normalizedInput", "retrieval"},
					"properties": map[string]any{
						"divisions":       map[string]any{"type": "object", "additionalProperties": map[string]any{"$ref": "#/components/schemas/AddressDivision"}},
						"normalizedInput": map[string]any{"$ref": "#/components/schemas/Address"},
						"kind":            map[string]string{"type": "string"},
						"retrieval":       map[string]any{"$ref": "#/components/schemas/Retrieval"},
					},
				},
				"ErrorResponseBody": map[string]any{
					"type":     "object",
					"required": []string{"ok", "error", "retrieval"},
					"properties": map[string]any{
						"ok":        map[string]any{"type": "boolean", "const": false},
						"error":     map[string]any{"$ref": "#/components/schemas/PublicError"},
						"retrieval": map[string]any{"$ref": "#/components/schemas/Retrieval"},
					},
				},
				"Address":         map[string]string{"type": "object"},
				"Point":           map[string]string{"type": "object"},
				"Election":        map[string]string{"type": "object"},
				"PollingLocation": map[string]string{"type": "object"},
				"Contest":         map[string]string{"type": "object"},
				"Administration":  map[string]string{"type": "object"},
				"Source":          map[string]string{"type": "object"},
				"Retrieval":       map[string]any{"type": "object", "properties": map[string]any{"apiVersion": map[string]string{"type": "string"}, "requestId": map[string]string{"type": "string"}, "retrievedAt": map[string]string{"type": "string", "format": "date-time"}, "provider": map[string]string{"type": "string"}, "electionId": map[string]string{"type": "string"}, "civicEndpoint": map[string]string{"type": "string"}, "fallbackUsed": map[string]string{"type": "boolean"}, "dataSource": map[string]string{"type": "string"}, "providerStatus": map[string]string{"type": "string"}}},
				"PublicError":     map[string]string{"type": "object"},
			},
		},
	}
	h.writeJSON(responseWriter, http.StatusOK, document)
}
