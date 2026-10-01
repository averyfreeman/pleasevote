package civic

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
)

// Coordinate accepts the numeric coordinate representation used by Civic and
// the numeric-string representation emitted by some older Civic deployments.
type Coordinate float64

// UnmarshalJSON keeps the provider boundary tolerant of both documented wire
// representations without weakening the typed application model.
func (c *Coordinate) UnmarshalJSON(data []byte) error {
	if bytes.Equal(bytes.TrimSpace(data), []byte("null")) {
		return nil
	}
	var number float64
	if err := json.Unmarshal(data, &number); err == nil {
		*c = Coordinate(number)
		return nil
	}
	var text string
	if err := json.Unmarshal(data, &text); err != nil {
		return fmt.Errorf("coordinate must be a number: %w", err)
	}
	parsed, err := strconv.ParseFloat(text, 64)
	if err != nil {
		return fmt.Errorf("coordinate must be numeric: %w", err)
	}
	*c = Coordinate(parsed)
	return nil
}

// Integer accepts the numeric-string values emitted by some Civic test and
// historical payloads for ballot placement/count fields.
type Integer int64

// UnmarshalJSON keeps sparse historical Civic payloads losslessly typed.
func (i *Integer) UnmarshalJSON(data []byte) error {
	trimmed := bytes.TrimSpace(data)
	if bytes.Equal(trimmed, []byte("null")) {
		return nil
	}
	var number int64
	if err := json.Unmarshal(trimmed, &number); err == nil {
		*i = Integer(number)
		return nil
	}
	var text string
	if err := json.Unmarshal(trimmed, &text); err != nil {
		return fmt.Errorf("integer must be numeric: %w", err)
	}
	parsed, err := strconv.ParseInt(text, 10, 64)
	if err != nil {
		return fmt.Errorf("integer must be numeric: %w", err)
	}
	*i = Integer(parsed)
	return nil
}

// Election is a Civic election resource.
type Election struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	ElectionDay   string `json:"electionDay"`
	OCDDivisionID string `json:"ocdDivisionId"`
}

// ElectionsResponse is the Civic elections endpoint response.
type ElectionsResponse struct {
	Elections []Election `json:"elections"`
	Kind      string     `json:"kind,omitempty"`
}

// Division is an Open Civic Data jurisdiction returned by the divisions API.
type Division struct {
	OCDID       string   `json:"ocdId,omitempty"`
	Name        string   `json:"name"`
	Aliases     []string `json:"aliases,omitempty"`
	AlsoKnownAs []string `json:"alsoKnownAs,omitempty"`
}

// DivisionSearchResponse is the official /divisions response shape.
type DivisionSearchResponse struct {
	Results []Division `json:"results"`
	Kind    string     `json:"kind,omitempty"`
}

// DivisionsByAddressResponse is the official /divisionsByAddress response
// shape, where the map key is the Open Civic Data division identifier.
type DivisionsByAddressResponse struct {
	Divisions       map[string]Division `json:"divisions"`
	NormalizedInput Address             `json:"normalizedInput"`
	Kind            string              `json:"kind,omitempty"`
}

// Address is the Civic address resource used for input and locations.
type Address struct {
	LocationName string   `json:"locationName,omitempty"`
	Line1        string   `json:"line1,omitempty"`
	Line2        string   `json:"line2,omitempty"`
	Line3        string   `json:"line3,omitempty"`
	AddressLine  []string `json:"addressLine,omitempty"`
	City         string   `json:"city,omitempty"`
	State        string   `json:"state,omitempty"`
	Zip          string   `json:"zip,omitempty"`
}

// Source describes the source of a Civic record.
type Source struct {
	Name     string `json:"name"`
	Official bool   `json:"official"`
}

// PollingLocation is the Civic location shape shared by election-day,
// early-vote, and ballot drop-off locations.
//
// Civic defines pollingLocations as locations where the voter is eligible to
// vote on election day. It does not imply that any returned location is the
// voter's individually assigned location.
type PollingLocation struct {
	Address       Address     `json:"address"`
	Notes         string      `json:"notes,omitempty"`
	PollingHours  string      `json:"pollingHours,omitempty"`
	Name          string      `json:"name,omitempty"`
	VoterServices string      `json:"voterServices,omitempty"`
	StartDate     string      `json:"startDate,omitempty"`
	EndDate       string      `json:"endDate,omitempty"`
	Latitude      *Coordinate `json:"latitude,omitempty"`
	Longitude     *Coordinate `json:"longitude,omitempty"`
	Sources       []Source    `json:"sources,omitempty"`
}

// Channel identifies a candidate's public media channel.
type Channel struct {
	Type string `json:"type"`
	ID   string `json:"id"`
}

// Candidate is a Civic candidate resource.
type Candidate struct {
	Name          string    `json:"name"`
	Party         string    `json:"party,omitempty"`
	CandidateURL  string    `json:"candidateUrl,omitempty"`
	Phone         string    `json:"phone,omitempty"`
	PhotoURL      string    `json:"photoUrl,omitempty"`
	Email         string    `json:"email,omitempty"`
	OrderOnBallot *Integer  `json:"orderOnBallot,omitempty"`
	Channels      []Channel `json:"channels,omitempty"`
}

// District identifies the electoral district for a contest.
type District struct {
	Name  string `json:"name,omitempty"`
	Scope string `json:"scope,omitempty"`
	ID    string `json:"id,omitempty"`
}

// Contest is the Civic contest resource, including candidate and referendum
// fields defined by voterInfoQuery.
type Contest struct {
	Type                       string      `json:"type"`
	PrimaryParty               string      `json:"primaryParty,omitempty"`
	ElectorateSpecifications   string      `json:"electorateSpecifications,omitempty"`
	Special                    string      `json:"special,omitempty"`
	BallotTitle                string      `json:"ballotTitle,omitempty"`
	Office                     string      `json:"office,omitempty"`
	Level                      []string    `json:"level,omitempty"`
	Roles                      []string    `json:"roles,omitempty"`
	District                   *District   `json:"district,omitempty"`
	NumberElected              *Integer    `json:"numberElected,omitempty"`
	NumberVotingFor            *Integer    `json:"numberVotingFor,omitempty"`
	BallotPlacement            *Integer    `json:"ballotPlacement,omitempty"`
	Candidates                 []Candidate `json:"candidates,omitempty"`
	ReferendumTitle            string      `json:"referendumTitle,omitempty"`
	ReferendumSubtitle         string      `json:"referendumSubtitle,omitempty"`
	ReferendumURL              string      `json:"referendumUrl,omitempty"`
	ReferendumBrief            string      `json:"referendumBrief,omitempty"`
	ReferendumText             string      `json:"referendumText,omitempty"`
	ReferendumPassageThreshold string      `json:"referendumPassageThreshold,omitempty"`
	ReferendumEffectOfAbstain  string      `json:"referendumEffectOfAbstain,omitempty"`
	Sources                    []Source    `json:"sources,omitempty"`
}

// ElectionOfficial is an official contact listed by Civic.
type ElectionOfficial struct {
	Name              string `json:"name,omitempty"`
	Title             string `json:"title,omitempty"`
	OfficePhoneNumber string `json:"officePhoneNumber,omitempty"`
	FaxNumber         string `json:"faxNumber,omitempty"`
	EmailAddress      string `json:"emailAddress,omitempty"`
}

// ElectionAdministrationBody contains state or local election administration
// links, services, hours, addresses, and officials.
type ElectionAdministrationBody struct {
	Name                                string             `json:"name,omitempty"`
	ElectionInfoURL                     string             `json:"electionInfoUrl,omitempty"`
	ElectionRegistrationURL             string             `json:"electionRegistrationUrl,omitempty"`
	ElectionRegistrationConfirmationURL string             `json:"electionRegistrationConfirmationUrl,omitempty"`
	ElectionNoticeText                  string             `json:"electionNoticeText,omitempty"`
	ElectionNoticeURL                   string             `json:"electionNoticeUrl,omitempty"`
	AbsenteeVotingInfoURL               string             `json:"absenteeVotingInfoUrl,omitempty"`
	VotingLocationFinderURL             string             `json:"votingLocationFinderUrl,omitempty"`
	BallotInfoURL                       string             `json:"ballotInfoUrl,omitempty"`
	ElectionRulesURL                    string             `json:"electionRulesUrl,omitempty"`
	VoterServices                       []string           `json:"voter_services,omitempty"`
	HoursOfOperation                    string             `json:"hoursOfOperation,omitempty"`
	CorrespondenceAddress               *Address           `json:"correspondenceAddress,omitempty"`
	PhysicalAddress                     *Address           `json:"physicalAddress,omitempty"`
	ElectionOfficials                   []ElectionOfficial `json:"electionOfficials,omitempty"`
}

// LocalJurisdiction contains local election information nested below a state
// record in Civic's response.
type LocalJurisdiction struct {
	Name                       string                      `json:"name,omitempty"`
	ElectionAdministrationBody *ElectionAdministrationBody `json:"electionAdministrationBody,omitempty"`
	Sources                    []Source                    `json:"sources,omitempty"`
}

// StateInformation contains jurisdiction-level election administration data.
type StateInformation struct {
	Name                       string                      `json:"name,omitempty"`
	ElectionAdministrationBody *ElectionAdministrationBody `json:"electionAdministrationBody,omitempty"`
	LocalJurisdiction          *LocalJurisdiction          `json:"local_jurisdiction,omitempty"`
	Sources                    []Source                    `json:"sources,omitempty"`
}

// VoterInfoResponse is the Civic voterInfoQuery response. The fields mirror
// the official API names so the adapter remains lossless for the frontend.
type VoterInfoResponse struct {
	// Status is optional because recorded fixtures from older Civic responses omit it.
	Status           string             `json:"status,omitempty"`
	Election         Election           `json:"election"`
	OtherElections   []Election         `json:"otherElections,omitempty"`
	NormalizedInput  Address            `json:"normalizedInput"`
	PollingLocations []PollingLocation  `json:"pollingLocations,omitempty"`
	EarlyVoteSites   []PollingLocation  `json:"earlyVoteSites,omitempty"`
	DropOffLocations []PollingLocation  `json:"dropOffLocations,omitempty"`
	Contests         []Contest          `json:"contests,omitempty"`
	State            []StateInformation `json:"state,omitempty"`
	MailOnly         bool               `json:"mailOnly,omitempty"`
	Kind             string             `json:"kind,omitempty"`
}

// HasUserInformation reports whether a response contains data useful to a
// voter beyond the election metadata itself. Civic may return useful fields
// alongside a non-success status, so status is preserved but never used to
// discard otherwise meaningful records.
func (response VoterInfoResponse) HasUserInformation() bool {
	return len(response.PollingLocations) > 0 ||
		len(response.EarlyVoteSites) > 0 ||
		len(response.DropOffLocations) > 0 ||
		len(response.Contests) > 0 ||
		len(response.State) > 0 ||
		response.MailOnly
}
