import ballerina/crypto;
import ballerina/http;
import ballerina/log;
import ballerina/mime;
import ballerina/uuid;
import ballerinax/mongodb;
import ballerina/io;

service /locations on httpListener {

    private final mongodb:Database eventDb;

    function init() returns error? {
        self.eventDb = check mongoClient->getDatabase("accessable");
        io:println("MongoDB connected to database 'accessable'");

    }

    // Add this new function inside your 'service' block in main.bal
    resource function post addPlaces(http:Request request) returns http:Created|http:Unauthorized|http:InternalServerError|http:BadRequest {
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error {
            http:Unauthorized unauth = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Missing Authorization header"}
            };
            return unauth;
        }
        string authHeader = authHeaderResult;
        if !authHeader.startsWith("Bearer ") {
            http:Unauthorized unauth = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Invalid token format"}
            };
            return unauth;
        }
        string token = authHeader.substring("Bearer ".length());
        string secretKey = JWT_SECRET;

        // Split the token
        int? dotIndex = token.indexOf(".");
        if dotIndex is () {
            http:Unauthorized unauth = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Invalid token"}
            };
            return unauth;
        }
        string encodedPayload = token.substring(0, dotIndex);
        string providedSignature = token.substring(dotIndex + 1);

        // Decode the base64 payload - Initialize payloadBytes properly
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes;

        if payloadBytesResult is byte[] {
            payloadBytes = payloadBytesResult;
        } else if payloadBytesResult is string {
            payloadBytes = payloadBytesResult.toBytes();
        } else {
            // Handle DecodeError or any other error case
            http:Unauthorized unauth = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Invalid token payload encoding"}
            };
            return unauth;
        }

        // Validate signature
        var signatureResult = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
        if signatureResult is error {
            http:InternalServerError err = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Token validation failed"}
            };
            return err;
        }
        string expectedSignature = signatureResult.toBase64();
        if providedSignature != expectedSignature {
            http:Unauthorized unauth = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Invalid token signature"}
            };
            return unauth;
        }

        // --- Get the Place Data ---
        json|http:ClientError payload = request.getJsonPayload();
        if payload is http:ClientError {
            http:BadRequest badRequest = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Invalid JSON payload"}
            };
            return badRequest;
        }

        Place|error placeDataResult = payload.cloneWithType(Place);
        if placeDataResult is error {
            http:BadRequest badRequest = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Invalid place data"}
            };
            return badRequest;
        }
        Place placeData = placeDataResult;

        // --- Add the Place to the Database ---
        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "DB error"}
            };
            return err;
        }
        var collection = db->getCollection("places");
        if collection is error {
            http:InternalServerError err = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "DB error"}
            };
            return err;
        }

        // Parse token payload for user ID
        string|error payloadStringResult = payloadBytes.toString();
        if payloadStringResult is error {
            http:InternalServerError err = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Failed to convert token payload to string"}
            };
            return err;
        }
        string payloadString = payloadStringResult;

        var parseResult = payloadString.fromJsonString();
        if parseResult is error {
            http:InternalServerError err = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Failed to parse token payload as JSON"}
            };
            return err;
        }
        json payloadJson = parseResult;

        // Extract the user ID (sub) from the payload
        string userId = "";
        if payloadJson is map<json> {
            json|error subField = payloadJson["sub"];
            if subField is string {
                userId = subField;
            } else if subField is json {
                userId = subField.toString();
            }
        }

        // Update the addedBy field with user ID
        placeData.addedBy = userId;

        var insertionResult = collection->insertOne(placeData);
        if insertionResult is error {
            http:InternalServerError err = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "DB error"}
            };
            return err;
        }

        http:Created createdResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: {"status": "success", "message": "Place added successfully"}
        };
        return createdResponse;
    }

    resource function post addPlace(@http:Payload PlacesInput input) returns Places|error {
        string placeId = uuid:createType1AsString();

        Places newPlace = {
            placeId,
            isApproved: false,
            ...input
        };

        mongodb:Collection placesCollection = check self.eventDb->getCollection("places");
        check placesCollection->insertOne(newPlace);

        return newPlace;
    }

    // --- GET all places ---
    resource function get getAllPlaces() returns http:Ok|http:InternalServerError {
        mongodb:Collection placesCollection = checkpanic self.eventDb->getCollection("places");
        stream<Places, error?> result = checkpanic placesCollection->find({isApproved: true});

        Places[] placesList = [];
        error? foreachErr = result.forEach(function(Places|error place) {
            if (place is Places) {
                placesList.push(place);
            } else {
                log:printError("Error processing place: " + place.message());
            }
        });
        if foreachErr is error {
            http:InternalServerError err = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Failed to process places"}
            };
            return err;
        }

        http:Ok ok = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: placesList
        };
        return ok;
    }

    // CORS preflight (not strictly required for GET, but included for completeness)
    resource function options getAllPlaces() returns http:Ok {
        http:Ok ok = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return ok;
    }

    // --- GET place by id ---
    resource function get getPlaceById/[string id]() returns Places|error {
        mongodb:Collection placesCollection = check self.eventDb->getCollection("places");
        stream<Places, error?> result = check placesCollection->find({placeId: id});

        Places[] placeList = check from Places p in result
            select p;

        if placeList.length() != 1 {
            return error("Failed to find a place with id: " + id);
        }
        return placeList[0];
    }

    // --- Add review ---
    resource function post addReview(@http:Payload ReviewInput input) returns http:Created|http:InternalServerError {
        mongodb:Collection reviewsCollection = checkpanic self.eventDb->getCollection("reviews");

        string reviewId = uuid:createType1AsString();
        Review newReview = {
            reviewId,
            isApproved: false,
            ...input
        };

        var insertRes = reviewsCollection->insertOne(newReview);
        if insertRes is error {
            http:InternalServerError err = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "DB error"}
            };
            return err;
        }

        http:Created created = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: {"status": "success"}
        };
        return created;
    }

    // CORS preflight for addReview
    resource function options addReview() returns http:Ok {
        http:Ok ok = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return ok;
    }

    // --- Get reviews by place ---
    resource function get getReviewsByPlace/[string placeId]() returns http:Ok|http:InternalServerError {
        mongodb:Collection reviewsCollection = checkpanic self.eventDb->getCollection("reviews");
        stream<Review, error?> result = checkpanic reviewsCollection->find({placeId, isApproved: true});

        Review[] list = [];
        error? fe = result.forEach(function(Review|error r) {
            if (r is Review) {
                list.push(r);
            }
        });
        if fe is error {
            http:InternalServerError err = {
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: {"error": "Failed to process reviews"}
            };
            return err;
        }

        http:Ok ok = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: list
        };
        return ok;
    }

    // CORS preflight for getReviewsByPlace
    resource function options getReviewsByPlace/[string placeId]() returns http:Ok {
        http:Ok ok = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return ok;
    }

    // --- Public stats: counts for approved places, approved reviews, approved users ---
    resource function get stats() returns http:Ok|http:InternalServerError {
        mongodb:Collection placesCollection = checkpanic self.eventDb->getCollection("places");
        mongodb:Collection reviewsCollection = checkpanic self.eventDb->getCollection("reviews");
        mongodb:Collection usersCollection = checkpanic self.eventDb->getCollection("users");

        int placesCount = 0;
        int reviewsCount = 0;
        int activeUsersCount = 0;
        int activeCaregiversCount = 0;

        // Count approved places
        stream<record {|anydata...;|}, error?>|error placesCur = placesCollection->find({isApproved: true});
        if placesCur is stream<record {|anydata...;|}, error?> {
            error? pe = placesCur.forEach(function(record {|anydata...;|} rec) {
                placesCount += 1;
            });
            if pe is error {
                // ignore counting errors and continue
            }
        }

        // Count approved reviews
        stream<record {|anydata...;|}, error?>|error reviewsCur = reviewsCollection->find({isApproved: true});
        if reviewsCur is stream<record {|anydata...;|}, error?> {
            error? re = reviewsCur.forEach(function(record {|anydata...;|} rec) {
                reviewsCount += 1;
            });
            if re is error {
                // ignore counting errors and continue
            }
        }

        // Count approved (active) users
        stream<record {|anydata...;|}, error?>|error usersCur = usersCollection->find({isApproved: true});
        if usersCur is stream<record {|anydata...;|}, error?> {
            error? ue = usersCur.forEach(function(record {|anydata...;|} rec) {
                activeUsersCount += 1;
            });
            if ue is error {
                // ignore counting errors and continue
            }
        }

        // Count approved caregivers (users with role "caregiver" and isApproved: true)
        stream<record {|anydata...;|}, error?>|error caregiversCur = usersCollection->find({isApproved: true, role: "caregiver"});
        if caregiversCur is stream<record {|anydata...;|}, error?> {
            error? ce = caregiversCur.forEach(function(record {|anydata...;|} rec) {
                activeCaregiversCount += 1;
            });
            if ce is error {
                // ignore counting errors and continue
            }
        }

        http:Ok ok = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: {
                placesCount: placesCount,
                reviewsCount: reviewsCount,
                activeUsersCount: activeUsersCount,
                activeCaregiversCount: activeCaregiversCount
            }
        };
        return ok;
    }

    // CORS preflight for stats
    resource function options stats() returns http:Ok {
        http:Ok ok = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return ok;
    }

    // --- Delete place by id ---
    resource function delete deletePlace/[string placeId]() returns string|error {
        mongodb:Collection places = check self.eventDb->getCollection("places");
        mongodb:DeleteResult deleteResult = check places->deleteOne({placeId});
        if deleteResult.deletedCount != 1 {
            return error(string `Failed to delete the Place ${placeId}`);
        }
        return placeId;
    }

     resource function put updatePlace(@http:Payload Places update) returns Places|error {
        mongodb:Collection places = check self.eventDb->getCollection("places");
        //  map<json> to hold the fields to update.
        map<json> updateFields = {};
        if update.name is string {
            updateFields["name"] = update.name;
        }
        if update.location is string {
            updateFields["location"] = update.location;
        }
        if update.hasRamp is boolean {
            updateFields["hasRamp"] = update.hasRamp;
        }
        if update.hasAccessibleRestroom is boolean {
            updateFields["hasAccessibleRestroom"] = update.hasAccessibleRestroom;
        }
        string placeId =update.placeId;

        mongodb:UpdateResult updateResult = check places->updateOne({placeId}, {set: updateFields});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the event with id ${placeId}`);
        }

        stream<Places, error?> result = check places->find({placeId: placeId});

        Places[] placeList = check from Places p in result
            select p;

        return placeList[0];
    }
}

public type PlacesInput record {|
    string name;
    string location;
    string locationUrl;
    string description;
    string addedBy;
    boolean hasRamp;
    boolean hasStepFreeEntrance;
    boolean hasElevator;
    boolean hasAccessibleRestroom;
    boolean hasWidePathways;
    boolean hasBrailleSignage;
    boolean hasHighContrastSignage;
    boolean hasAudioGuidance;
    boolean hasSubtitledVideos;
    boolean hasSignLanguage;
    boolean hasVisualAlarmSystem;
    boolean hasQuietSensoryArea;
    boolean hasClearSimpleSignage;
    boolean hasFirstAidStation;
    boolean hasRestSeating;
    string image1?;
    string image2?;
    string image3?;
|};

public type Places record {|
    string placeId;
    string name;
    string location;
    string locationUrl;
    string description;
    string addedBy;
    boolean isApproved;
    boolean hasRamp;
    boolean hasStepFreeEntrance;
    boolean hasElevator;
    boolean hasAccessibleRestroom;
    boolean hasWidePathways;
    boolean hasBrailleSignage;
    boolean hasHighContrastSignage;
    boolean hasAudioGuidance;
    boolean hasSubtitledVideos;
    boolean hasSignLanguage;
    boolean hasVisualAlarmSystem;
    boolean hasQuietSensoryArea;
    boolean hasClearSimpleSignage;
    boolean hasFirstAidStation;
    boolean hasRestSeating;
    string image1?;
    string image2?;
    string image3?;
|};

public type ReviewInput record {|
    string placeId;
    string userEmail?;
    int rating;
    string comment?;
    string createdAt?;
|};

public type Review record {|
    string reviewId;
    string placeId;
    string userEmail?;
    int rating;
    string comment?;
    string createdAt?;
    boolean isApproved;
|};
