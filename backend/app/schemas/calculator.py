from typing import Optional, Dict
from pydantic import BaseModel, Field

class LandConversionRequest(BaseModel):
    value: float = Field(gt=0, description="Area value to convert")
    fromUnit: str = Field(..., description="acres, hectares, sq_meters, sq_feet, cents, guntas")

class LandConversionResponse(BaseModel):
    originalValue: float
    originalUnit: str
    conversions: Dict[str, float]
    regionalNotes: str

class SeedFertilizerCalcRequest(BaseModel):
    crop: str # "Paddy", "Cotton", "Groundnut", "Chili", "Bengal Gram", "Maize"
    acres: float = Field(gt=0)
    farmingMethod: str = "Traditional" # "Traditional", "Direct Seeded", "SRI"

class YieldMarginCalcRequest(BaseModel):
    crop: str
    acres: float = Field(gt=0)
    expectedYieldPerAcreQuintals: float = Field(gt=0)
    expectedPricePerQuintal: float = Field(gt=0)
    seedCostPerAcre: float = Field(ge=0)
    fertilizerPesticideCostPerAcre: float = Field(ge=0)
    laborMachineryCostPerAcre: float = Field(ge=0)
    irrigationCostPerAcre: float = Field(ge=0)
    otherCostPerAcre: float = Field(ge=0, default=0)

class CalculatorResultResponse(BaseModel):
    title: str
    parameters: Dict[str, float | str]
    formulaUsed: str
    metrics: Dict[str, float | str]
    disclaimer: str

class GpsCoordinate(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")
    accuracy: Optional[float] = Field(None, description="GPS Accuracy in meters if available")
    label: Optional[str] = Field(None, description="Optional waypoint name or label")

class GpsEdgeDetail(BaseModel):
    fromPoint: int
    toPoint: int
    distanceMeters: float
    distanceFeet: float

class GpsFencingEstimate(BaseModel):
    perimeterMeters: float
    perimeterFeet: float
    poleSpacingFeet: float
    wireStrands: int
    totalPolesNeeded: int
    cornerPoles: int
    totalWireLengthMeters: float
    wireRollsEstimated: float

class GpsLandAreaRequest(BaseModel):
    coordinates: list[GpsCoordinate] = Field(..., min_length=3, description="List of GPS points representing polygon boundary")
    fencePoleSpacingFeet: float = Field(default=10.0, gt=0, description="Spacing between fence poles in feet")
    fenceWireStrands: int = Field(default=4, ge=1, le=10, description="Number of wire strands around boundary")

class GpsLandAreaResponse(BaseModel):
    totalPoints: int
    areaSqMeters: float
    areaAcres: float
    areaCents: float
    areaGuntas: float
    areaHectares: float
    areaSqFeet: float
    areaSqYards: float
    perimeterMeters: float
    perimeterFeet: float
    edges: list[GpsEdgeDetail]
    centroid: Dict[str, float]
    fencing: GpsFencingEstimate
    regionalSummary: str

