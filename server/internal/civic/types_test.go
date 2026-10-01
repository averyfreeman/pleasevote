package civic

import "testing"

func TestVoterInfoResponseKeepsUsefulFieldsWhenStatusIsNotSuccess(t *testing.T) {
	response := VoterInfoResponse{
		Status:           "invalid",
		PollingLocations: []PollingLocation{{Address: Address{Line1: "Election Day Hall"}}},
		DropOffLocations: []PollingLocation{{Address: Address{Line1: "Ballot Box"}}},
		State:            []StateInformation{{Name: "Washington"}},
	}

	if !response.HasUserInformation() {
		t.Fatal("non-success response with useful Civic fields was discarded")
	}
}

func TestVoterInfoResponseDoesNotTreatElectionMetadataAloneAsUserInformation(t *testing.T) {
	response := VoterInfoResponse{Status: "success", Election: Election{ID: "3000"}}
	if response.HasUserInformation() {
		t.Fatal("election metadata alone should not count as voter information")
	}
}
