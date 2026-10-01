package civic

import (
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/averyfreeman/pleasevote/server/internal/provider"
)

// The embedded files keep the debug command independent of the repository's
// working directory and make the deterministic Civic test data available to a
// built server binary.
//
//go:embed testdata/elections-2000.json
var fixtureElectionsJSON []byte

//go:embed testdata/voterinfo-2000.json
var fixtureVoterInfoJSON []byte

// FixtureClient serves the documented Civic election 2000 sample response for
// any address. It is intentionally opt-in through voterinfo.Service.Debug.
type FixtureClient struct {
	loadOnce         sync.Once
	loadErr          error
	elections        ElectionsResponse
	voterInfo        VoterInfoResponse
	divisions        DivisionSearchResponse
	divisionsAddress DivisionsByAddressResponse
}

// NewFixtureClient constructs the embedded Civic test database without making
// a network request.
func NewFixtureClient() *FixtureClient {
	return &FixtureClient{}
}

func (c *FixtureClient) load() {
	c.loadOnce.Do(func() {
		if err := json.Unmarshal(fixtureElectionsJSON, &c.elections); err != nil {
			c.loadErr = fmt.Errorf("decode Civic election fixture: %w", err)
			return
		}
		if err := json.Unmarshal(fixtureVoterInfoJSON, &c.voterInfo); err != nil {
			c.loadErr = fmt.Errorf("decode Civic voter-information fixture: %w", err)
			return
		}
		c.divisions = DivisionSearchResponse{Kind: "civicinfo#divisionSearchResponse", Results: []Division{{OCDID: "ocd-division/country:us", Name: "United States"}}}
		c.divisionsAddress = DivisionsByAddressResponse{
			Kind:            "civicinfo#divisionsByAddressResponse",
			NormalizedInput: c.voterInfo.NormalizedInput,
			Divisions:       map[string]Division{"ocd-division/country:us": {Name: "United States"}},
		}
	})
}

// ListElections returns the fixture election list.
func (c *FixtureClient) ListElections(context.Context) (ElectionsResponse, error) {
	c.load()
	if c.loadErr != nil {
		return ElectionsResponse{}, &provider.Error{Kind: provider.KindInvalidResponse, Operation: "civic.fixture.elections", Message: "Civic fixture could not be decoded"}
	}
	return c.elections, nil
}

// VoterInfo returns the fixture response for election 2000 regardless of the
// submitted address. Other election IDs are intentionally not represented.
func (c *FixtureClient) VoterInfo(_ context.Context, _ string, electionID *int64) (VoterInfoResponse, error) {
	c.load()
	if c.loadErr != nil {
		return VoterInfoResponse{}, &provider.Error{Kind: provider.KindInvalidResponse, Operation: "civic.fixture.voterinfo", Message: "Civic fixture could not be decoded"}
	}
	if electionID == nil || *electionID != 2000 {
		return VoterInfoResponse{}, &provider.Error{Kind: provider.KindNoData, Operation: "civic.fixture.voterinfo", Message: "Civic fixture has no data for that election"}
	}
	return c.voterInfo, nil
}

// Divisions returns the small deterministic division fixture.
func (c *FixtureClient) Divisions(context.Context, string) (DivisionSearchResponse, error) {
	c.load()
	if c.loadErr != nil {
		return DivisionSearchResponse{}, &provider.Error{Kind: provider.KindInvalidResponse, Operation: "civic.fixture.divisions", Message: "Civic fixture could not be decoded"}
	}
	return c.divisions, nil
}

// DivisionsByAddress returns the small deterministic address division fixture.
func (c *FixtureClient) DivisionsByAddress(context.Context, string) (DivisionsByAddressResponse, error) {
	c.load()
	if c.loadErr != nil {
		return DivisionsByAddressResponse{}, &provider.Error{Kind: provider.KindInvalidResponse, Operation: "civic.fixture.divisionsByAddress", Message: "Civic fixture could not be decoded"}
	}
	return c.divisionsAddress, nil
}
