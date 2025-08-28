import ballerina/crypto;
import ballerina/http;
import ballerina/io;
import ballerina/mime;
import ballerinax/mongodb;

// Types moved to types.bal

// Database setup (from types.bal)
final mongodb:Client mongoClient = MONGO_CLIENT;

// Helper function to validate token and extract user ID
function validateToken(http:Request request) returns string|http:Unauthorized {
    string|error authHeaderResult = request.getHeader("Authorization");
    if authHeaderResult is error {
        http:Unauthorized unauth = {
            headers: {"Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173")},
            body: {"error": "Missing Authorization header"}
        };
        return unauth;
    }
    
    string authHeader = authHeaderResult;
    
    if !authHeader.startsWith("Bearer ") {
        http:Unauthorized unauth = {
            headers: {"Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173")},
            body: {"error": "Invalid token format"}
        };
        return unauth;
    }
    
    string token = authHeader.substring("Bearer ".length());
    
    string secretKey = JWT_SECRET;
    
    int? dotIndex = token.indexOf(".");
    if dotIndex is () {
        http:Unauthorized unauth = {
            headers: {"Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173")},
            body: {"error": "Invalid token"}
        };
        return unauth;
    }
    
    string encodedPayload = token.substring(0, dotIndex);
    string providedSignature = token.substring(dotIndex + 1);
    
    var payloadBytesResult = mime:base64Decode(encodedPayload);
    byte[] payloadBytes;
    if payloadBytesResult is byte[] {
        payloadBytes = payloadBytesResult;
    } else if payloadBytesResult is string {
        payloadBytes = payloadBytesResult.toBytes();
    } else {
        http:Unauthorized unauth = {
            headers: {"Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173")},
            body: {"error": "Invalid token payload encoding"}
        };
        return unauth;
    }
    
    
    var signatureResult = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
    if signatureResult is error {
        http:Unauthorized unauth = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {"error": "Token validation failed"}
        };
        return unauth;
    }
    
    string expectedSignature = signatureResult.toBase64();
    
    if providedSignature != expectedSignature {
        http:Unauthorized unauth = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {"error": "Invalid token signature"}
        };
        return unauth;
    }
    
    string|error payloadStringResult = string:fromBytes(payloadBytes);
    if payloadStringResult is error {
        http:Unauthorized unauth = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {"error": "Failed to convert token payload to string"}
        };
        return unauth;
    }
    
    string payloadString = payloadStringResult;
    
    var parseResult = payloadString.fromJsonString();
    if parseResult is error {
        http:Unauthorized unauth = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {"error": "Failed to parse token payload as JSON"}
        };
        return unauth;
    }
    
    json payloadJson = parseResult;
    string userId = "";
    if payloadJson is map<json> {
        json|error subField = payloadJson["sub"];
        if subField is string {
            userId = subField;
        } else if subField is json {
            userId = subField.toString();
        }
    }
    
    
    if userId == "" {
        http:Unauthorized unauth = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {"error": "Invalid token payload"}
        };
        return unauth;
    }
    
    
    return userId;
}

service / on httpListener {
    // CORS handler
    resource function options auth() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173"),
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
        return okResponse;
    }
    
    // Add this inside your 'service' block in main.bal
    resource function options places() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173"),
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization" // Also allow the Authorization header
            }
        };
        return okResponse;
    }

    // CORS for admin routes
    resource function options admin/users/pending() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173"),
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    // CORS for admin list all users
    resource function options admin/users/all() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173"),
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    // Admin: Fetch pending places
    resource function get admin/places/pending(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError {
        // Require admin
        string|http:Unauthorized userIdOrErr = validateToken(request);
        if userIdOrErr is http:Unauthorized { return userIdOrErr; }

        // Check role
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error {
            http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Missing Authorization header"} };
            return unauth;
        }
        string authHeader = authHeaderResult;
        string token = authHeader.startsWith("Bearer ") ? authHeader.substring("Bearer ".length()) : "";
        int? dotIndex = token.indexOf(".");
        if dotIndex is () {
            http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token"} };
            return unauth;
        }
        string encodedPayload = token.substring(0, dotIndex);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes = payloadBytesResult is byte[] ? payloadBytesResult : payloadBytesResult is string ? payloadBytesResult.toBytes() : [];
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error {
            http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token payload"} };
            return unauth;
        }
        var parseResult = payloadStringResult.fromJsonString();
        if parseResult is error {
            http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token payload"} };
            return unauth;
        }
        string role = "";
        if parseResult is map<json> { var tp = (<map<json>>parseResult).cloneWithType(TokenPayload); if tp is TokenPayload { role = tp.role; } }
        if role.trim().toLowerAscii() != "admin" {
            http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Forbidden"} };
            return unauth;
        }

        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"} };
            return err;
        }
        mongodb:Collection placesCollection = checkpanic db->getCollection("places");

        json[] pending = [];
        stream<record {|anydata...;|}, error?>|error cur = placesCollection->find({"isApproved": false});
        if cur is stream<record {|anydata...;|}, error?> {
            error? foreachResult = cur.forEach(function(record {|anydata...;|} p) {
                string name = p["name"].toString();
                string location = p["location"].toString();
                string addedBy = p["addedBy"].toString();
                string id = p["placeId"].toString();
                json j = { "name": name, "location": location, "addedBy": addedBy, "id": id };
                pending.push(j);
            });
            if foreachResult is error {
                // ignore
            }
        }

        http:Ok ok = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: pending };
        return ok;
    }

    // Admin: Approve/Decline place
    resource function post admin/places/approve(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError|http:BadRequest {
        string|http:Unauthorized userIdOrErr = validateToken(request);
        if userIdOrErr is http:Unauthorized { return userIdOrErr; }

        // Check role same as above
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error {
            http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Missing Authorization header"} };
            return unauth;
        }
        string authHeader = authHeaderResult;
        string token = authHeader.startsWith("Bearer ") ? authHeader.substring("Bearer ".length()) : "";
        int? dotIndex = token.indexOf(".");
        if dotIndex is () {
            http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token"} };
            return unauth;
        }
        string encodedPayload = token.substring(0, dotIndex);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes = payloadBytesResult is byte[] ? payloadBytesResult : payloadBytesResult is string ? payloadBytesResult.toBytes() : [];
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error {
            http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token payload"} };
            return unauth;
        }
        var parseResult = payloadStringResult.fromJsonString();
        if parseResult is error {
            http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token payload"} };
            return unauth;
        }
        string role = "";
        if parseResult is map<json> { var tp = (<map<json>>parseResult).cloneWithType(TokenPayload); if tp is TokenPayload { role = tp.role; } }
        if role.trim().toLowerAscii() != "admin" {
            http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Forbidden"} };
            return unauth;
        }

        json|http:ClientError payload = request.getJsonPayload();
        if payload is http:ClientError {
            http:BadRequest bad = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid JSON payload"} };
            return bad;
        }
        string placeId = "";
        if payload is map<json> {
            json|error idJson = payload["id"];
            if idJson is string {
                placeId = idJson;
            } else if idJson is json {
                placeId = idJson.toString();
            } else {
                http:BadRequest bad = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Missing id"} };
                return bad;
            }
        }

        var db = mongoClient->getDatabase("accessable");
        if db is error { http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "DB error"} }; return err; }
        mongodb:Collection placesCollection = checkpanic db->getCollection("places");

        var updateRes = placesCollection->updateOne({"placeId": placeId}, {set: {"isApproved": true}});
        if updateRes is error { http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Update failed"} }; return err; }

        http:Ok ok = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"status": "ok"} };
        return ok;
    }

    resource function post admin/places/decline(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError|http:BadRequest {
        string|http:Unauthorized userIdOrErr = validateToken(request);
        if userIdOrErr is http:Unauthorized { return userIdOrErr; }

        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Missing Authorization header"} }; return unauth; }
        string authHeader = authHeaderResult;
        string token = authHeader.startsWith("Bearer ") ? authHeader.substring("Bearer ".length()) : "";
        int? dotIndex = token.indexOf(".");
        if dotIndex is () { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token"} }; return unauth; }
        string encodedPayload = token.substring(0, dotIndex);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes = payloadBytesResult is byte[] ? payloadBytesResult : payloadBytesResult is string ? payloadBytesResult.toBytes() : [];
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token payload"} }; return unauth; }
        var parseResult = payloadStringResult.fromJsonString();
        if parseResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token payload"} }; return unauth; }
        string role = "";
        if parseResult is map<json> { var tp = (<map<json>>parseResult).cloneWithType(TokenPayload); if tp is TokenPayload { role = tp.role; } }
        if role.trim().toLowerAscii() != "admin" { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Forbidden"} }; return unauth; }

        json|http:ClientError payload = request.getJsonPayload();
        if payload is http:ClientError { http:BadRequest bad = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid JSON payload"} }; return bad; }
        string placeId = "";
        if payload is map<json> {
            json|error idJson = payload["id"];
            if idJson is string {
                placeId = idJson;
            } else if idJson is json {
                placeId = idJson.toString();
            } else { http:BadRequest bad = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Missing id"} }; return bad; }
        }

        var db = mongoClient->getDatabase("accessable");
        if db is error { http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "DB error"} }; return err; }
        var placesCollection = db->getCollection("places");
        if placesCollection is error { http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "DB error"} }; return err; }

        var delRes = placesCollection->deleteOne({"placeId": placeId});
        if delRes is error { http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Delete failed"} }; return err; }

        http:Ok ok = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"status": "ok"} };
        return ok;
    }

    // Admin: Fetch pending reviews
    resource function get admin/reviews/pending(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError {
        // Require admin (reuse validation)
        string|http:Unauthorized userIdOrErr = validateToken(request);
        if userIdOrErr is http:Unauthorized { return userIdOrErr; }

        // Role check
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Missing Authorization header"} }; return unauth; }
        string authHeader = authHeaderResult;
        string token = authHeader.startsWith("Bearer ") ? authHeader.substring("Bearer ".length()) : "";
        int? dotIndex = token.indexOf(".");
        if dotIndex is () { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token"} }; return unauth; }
        string encodedPayload = token.substring(0, dotIndex);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes = payloadBytesResult is byte[] ? payloadBytesResult : payloadBytesResult is string ? payloadBytesResult.toBytes() : [];
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token payload"} }; return unauth; }
        var parseResult = payloadStringResult.fromJsonString();
        if parseResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token payload"} }; return unauth; }
        string role = "";
        if parseResult is map<json> { var tp = (<map<json>>parseResult).cloneWithType(TokenPayload); if tp is TokenPayload { role = tp.role; } }
        if role.trim().toLowerAscii() != "admin" { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Forbidden"} }; return unauth; }

        var db = mongoClient->getDatabase("accessable");
        if db is error { http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "DB error"} }; return err; }
        mongodb:Collection reviewsCollection = checkpanic db->getCollection("reviews");
        mongodb:Collection placesCollection = checkpanic db->getCollection("places");
        mongodb:Collection usersCollection = checkpanic db->getCollection("users");

        json[] pending = [];
        stream<record {|anydata...;|}, error?>|error cur = reviewsCollection->find({"isApproved": false});
        if cur is stream<record {|anydata...;|}, error?> {
            error? foreachResult = cur.forEach(function(record {|anydata...;|} r) {
                string id = r["reviewId"].toString();
                string email = "";
                anydata ueField = r["userEmail"];
                if ueField is string {
                    email = ueField;
                } else if ueField is json {
                    email = ueField.toString();
                }
                if email == "" {
                    anydata legacyEmail = r["email"];
                    if legacyEmail is string {
                        email = legacyEmail;
                    } else if legacyEmail is json {
                        email = legacyEmail.toString();
                    }
                }
                string placeId = r["placeId"].toString();
                string reviewText = r["comment"].toString();
                int rating = 0;
                anydata ratingField = r["rating"];
                if ratingField is int { rating = ratingField; } else if ratingField is string { rating = checkpanic int:fromString(ratingField); }

                string placeName = "";
                // Lookup place name
                record {|anydata...;|}|error|() placeDoc = placesCollection->findOne({"placeId": placeId});
                if placeDoc is record {|anydata...;|} {
                    anydata pn = placeDoc["name"];
                    if pn is string { placeName = pn; } else { placeName = pn.toString(); }
                }

                string username = "";
                if email != "" {
                    // Lookup user by email to get username
                    record {|anydata...;|}|error|() userDoc = usersCollection->findOne({"email": email});
                    if userDoc is record {|anydata...;|} {
                        anydata un = userDoc["username"];
                        if un is string { username = un; } else { username = un.toString(); }
                    }
                }

                json j = { "id": id, "email": email, "userEmail": email, "username": username, "placeId": placeId, "placeName": placeName, "rating": rating, "reviewText": reviewText };
                pending.push(j);
            });
            if foreachResult is error {
                // ignore
            }
        }

        http:Ok ok = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: pending };
        return ok;
    }

    // Admin: Approve/Decline review
    resource function post admin/reviews/approve(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError|http:BadRequest {
        string|http:Unauthorized userIdOrErr = validateToken(request);
        if userIdOrErr is http:Unauthorized { return userIdOrErr; }

        // Role check (same as above)
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Missing Authorization header"} }; return unauth; }
        string authHeader = authHeaderResult;
        string token = authHeader.startsWith("Bearer ") ? authHeader.substring("Bearer ".length()) : "";
        int? dotIndex = token.indexOf(".");
        if dotIndex is () { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token"} }; return unauth; }
        string encodedPayload = token.substring(0, dotIndex);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes = payloadBytesResult is byte[] ? payloadBytesResult : payloadBytesResult is string ? payloadBytesResult.toBytes() : [];
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token payload"} }; return unauth; }
        var parseResult = payloadStringResult.fromJsonString();
        if parseResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token payload"} }; return unauth; }
        string role = "";
        if parseResult is map<json> { var tp = (<map<json>>parseResult).cloneWithType(TokenPayload); if tp is TokenPayload { role = tp.role; } }
        if role.trim().toLowerAscii() != "admin" { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Forbidden"} }; return unauth; }

        json|http:ClientError payload = request.getJsonPayload();
        if payload is http:ClientError { http:BadRequest bad = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid JSON payload"} }; return bad; }
        string reviewId = "";
        if payload is map<json> {
            json|error idJson = payload["id"];
            if idJson is string { reviewId = idJson; } else if idJson is json { reviewId = idJson.toString(); } else { http:BadRequest bad = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Missing id"} }; return bad; }
        }

        var db = mongoClient->getDatabase("accessable");
        if db is error { http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "DB error"} }; return err; }
        mongodb:Collection reviewsCollection = checkpanic db->getCollection("reviews");

        var updateRes = reviewsCollection->updateOne({"reviewId": reviewId}, {set: {"isApproved": true}});
        if updateRes is error { http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Update failed"} }; return err; }

        http:Ok ok = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"status": "ok"} };
        return ok;
    }

    resource function post admin/reviews/decline(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError|http:BadRequest {
        string|http:Unauthorized userIdOrErr = validateToken(request);
        if userIdOrErr is http:Unauthorized { return userIdOrErr; }

        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Missing Authorization header"} }; return unauth; }
        string authHeader = authHeaderResult;
        string token = authHeader.startsWith("Bearer ") ? authHeader.substring("Bearer ".length()) : "";
        int? dotIndex = token.indexOf(".");
        if dotIndex is () { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token"} }; return unauth; }
        string encodedPayload = token.substring(0, dotIndex);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes = payloadBytesResult is byte[] ? payloadBytesResult : payloadBytesResult is string ? payloadBytesResult.toBytes() : [];
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token payload"} }; return unauth; }
        var parseResult = payloadStringResult.fromJsonString();
        if parseResult is error { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid token payload"} }; return unauth; }
        string role = "";
        if parseResult is map<json> { var tp = (<map<json>>parseResult).cloneWithType(TokenPayload); if tp is TokenPayload { role = tp.role; } }
        if role.trim().toLowerAscii() != "admin" { http:Unauthorized unauth = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Forbidden"} }; return unauth; }

        json|http:ClientError payload = request.getJsonPayload();
        if payload is http:ClientError { http:BadRequest bad = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid JSON payload"} }; return bad; }
        string reviewId = "";
        if payload is map<json> {
            json|error idJson = payload["id"];
            if idJson is string { reviewId = idJson; } else if idJson is json { reviewId = idJson.toString(); } else { http:BadRequest bad = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Missing id"} }; return bad; }
        }

        var db = mongoClient->getDatabase("accessable");
        if db is error { http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "DB error"} }; return err; }
        mongodb:Collection reviewsCollection = checkpanic db->getCollection("reviews");

        var delRes = reviewsCollection->deleteOne({"reviewId": reviewId});
        if delRes is error { http:InternalServerError err = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Delete failed"} }; return err; }

        http:Ok ok = { headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"status": "ok"} };
        return ok;
    }
    resource function options admin/users/approve() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173"),
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    // CORS for admin approve with path param
    resource function options admin/users/approve/[string id]() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173"),
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    // CORS for admin places/reviews
    resource function options admin/places/pending() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": getConfig("FRONTEND_URL", "http://localhost:5173"),
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    resource function options admin/reviews/pending() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    resource function options admin/places/approve() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    resource function options admin/places/decline() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    resource function options admin/reviews/approve() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    resource function options admin/reviews/decline() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }
    
    // Authentication endpoint
    resource function post auth(http:Request request) returns http:Ok|http:Created|http:Unauthorized|http:BadRequest|http:InternalServerError {
        // Get JSON payload from request body
        json|http:ClientError payload = request.getJsonPayload();
        if payload is http:ClientError {
            http:BadRequest badRequest = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Invalid JSON payload"}
            };
            return badRequest;
        }
        
        // Parse action and data
        json|error actionJson = payload.action;
        if actionJson is error {
            http:BadRequest badRequest = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Missing 'action' field"}
            };
            return badRequest;
        }
        string action = <string>actionJson;
        
        json|error dataJson = payload.data;
        if dataJson is error {
            http:BadRequest badRequest = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Missing 'data' field"}
            };
            return badRequest;
        }
        
        if action is "register" {
            // --- REGISTRATION LOGIC ---
            RegistrationData|error reg_data_result = dataJson.cloneWithType(RegistrationData);
            if reg_data_result is error {
                http:BadRequest badRequest = {
                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                    body: {"error": "Invalid registration data"}
                };
                return badRequest;
            }
            RegistrationData regData = reg_data_result;
            
            // Hash the plain password
            string passwordHash = crypto:hashSha256(regData.password.toBytes()).toBase64();
            User newUser = {
                username: regData.username,
                email: regData.email,
                password_hash: passwordHash,
                role: regData.role,
                isApproved: false,
                disabilities: regData.disabilities,
                traits: regData.traits
            };
            
            var db = mongoClient->getDatabase("accessable");
            if db is error {
                http:InternalServerError err = {
                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                    body: {"error": "DB connection error"}
                };
                return err;
            }
            
            var collection = db->getCollection("users");
            if collection is error {
                http:InternalServerError err = {
                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                    body: {"error": "Collection error"}
                };
                return err;
            }
            
            // Check if user already exists
            var existingUser = collection->findOne({email: regData.email}, targetType = User);
            if existingUser is User {
                http:BadRequest badRequest = {
                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                    body: {"error": "User with this email already exists"}
                };
                return badRequest;
            }
            
            var insertionResult = collection->insertOne(newUser);
            if insertionResult is error {
                http:InternalServerError err = {
                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                    body: {"error": "Failed to create user"}
                };
                return err;
            }
            
            http:Created createdResponse = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {
                    "status": "success",
                    "message": "User created successfully",
                    "userId": insertionResult.toString(),
                    "user": {
                        "username": newUser.username,
                        "email": newUser.email,
                        "role": newUser.role,
                        "isApproved": newUser.isApproved,
                        "disabilities": newUser.disabilities ?: [],
                        "traits": newUser.traits ?: []
                    }
                }
            };
            return createdResponse;
        } else if action is "login" {
            // --- LOGIN LOGIC ---
            LoginData|error login_data_result = dataJson.cloneWithType(LoginData);
            if login_data_result is error {
                http:BadRequest badRequest = {
                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                    body: {"error": "Invalid login data"}
                };
                return badRequest;
            }
            LoginData login_data = login_data_result;
            
            
            
            var db = mongoClient->getDatabase("accessable");
            if db is error {
                http:InternalServerError err = {
                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                    body: {"error": "Database connection error"}
                };
                return err;
            }
            
            var collection = db->getCollection("users");
            if collection is error {
                http:InternalServerError err = {
                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                    body: {"error": "Collection error"}
                };
                return err;
            }
            
            // Try with User type first, fallback to manual parsing if needed
            User|error|() userQuery = collection->findOne({email: login_data.email}, targetType = User);
            
            if userQuery is error {
                // Fallback: try without target type and parse manually
                record {|anydata...;|}|error|() rawQuery = collection->findOne({email: login_data.email});
                if rawQuery is error {
                    http:Unauthorized unauth = {
                        headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                        body: {"error": "Invalid email or password"}
                    };
                    return unauth;
                } else if rawQuery is () {
                    http:Unauthorized unauth = {
                        headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                        body: {"error": "Invalid email or password"}
                    };
                    return unauth;
                } else {
                    // We have raw data
                    
                    // Try to manually extract the password hash for comparison
                    anydata passwordHashField = rawQuery["password_hash"];
                    if passwordHashField is string {
                        string storedPasswordHash = passwordHashField;
                        string providedPasswordHash = crypto:hashSha256(login_data.password.toBytes()).toBase64();
                        
                        
                        
                        if providedPasswordHash == storedPasswordHash {
                            // Successful login with manual parsing
                            anydata usernameField = rawQuery["username"];
                            anydata emailField = rawQuery["email"];
                            anydata idField = rawQuery["_id"];
                            anydata roleField = rawQuery["role"];
                            anydata isApprovedField = rawQuery["isApproved"];
                            string username = usernameField is string ? usernameField : "";
                            string userEmail = emailField is string ? emailField : "";
                            
                            // Convert MongoDB ObjectId to string properly
                            string userId = "";
                            if idField is string {
                                userId = idField;
                            } else {
                                userId = idField.toString();
                            }
                            
                            
                            
                            string userRole = roleField is string ? roleField : "pwd";
                            boolean userIsApproved = isApprovedField is boolean ? isApprovedField : false;
                            
                            // Create token
                            string secretKey = JWT_SECRET;
                            // Use email as token subject to avoid ObjectId conversion issues
                            json tokenPayload = {"sub": userEmail, "issuer": "AccessAble", "role": userRole, "isApproved": userIsApproved};
                            byte[] payloadBytes = tokenPayload.toJsonString().toBytes();
                            string encodedPayload = payloadBytes.toBase64();
                            
                            byte[]|crypto:Error signatureBytesResult = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
                            if signatureBytesResult is crypto:Error {
                                http:InternalServerError err = {
                                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                                    body: {"error": "Token creation failed"}
                                };
                                return err;
                            }
                            string encodedSignature = signatureBytesResult.toBase64();
                            string token = encodedPayload + "." + encodedSignature;
                            
                            http:Ok okResponse = {
                                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                                body: {
                                    "status": "success",
                                    "message": "Login successful",
                                    "token": token,
                                    "user": {
                                        "id": userId,
                                        "username": username,
                                        "email": userEmail,
                                        "role": userRole,
                                        "isApproved": userIsApproved
                                    }
                                }
                            };
                            return okResponse;
                        }
                    }
                    
                    http:Unauthorized unauth = {
                        headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                        body: {"error": "Invalid email or password"}
                    };
                    return unauth;
                }
            } else if userQuery is () {
                http:Unauthorized unauth = {
                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                    body: {"error": "Invalid email or password"}
                };
                return unauth;
            } else {
                User foundUser = userQuery;
                
                // Extract user details
                string userEmail = foundUser.email;
                string username = foundUser.username;
                string storedPasswordHash = foundUser.password_hash;
                
                // Convert MongoDB ObjectId to string properly with safe narrowing
                string userId = "";
                anydata foundUserId = foundUser._id;
                if foundUserId is string {
                    userId = foundUserId;
                } else if foundUserId is () {
                    userId = "";
                } else {
                    userId = foundUserId.toString();
                }
                
                
                
                string userRole = foundUser.role;
                boolean userIsApproved = foundUser.isApproved;
                
                // Hash the provided password and compare with stored hash
                string providedPasswordHash = crypto:hashSha256(login_data.password.toBytes()).toBase64();
                
                
                
                if providedPasswordHash != storedPasswordHash {
                    http:Unauthorized unauth = {
                        headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                        body: {"error": "Invalid email or password"}
                    };
                    return unauth;
                }
                
                // Create token
                string secretKey = JWT_SECRET;
                // Use email as token subject to avoid ObjectId conversion issues
                json tokenPayload = {"sub": userEmail, "issuer": "AccessAble", "role": userRole, "isApproved": userIsApproved};
                byte[] payloadBytes = tokenPayload.toJsonString().toBytes();
                string encodedPayload = payloadBytes.toBase64();
                
                byte[]|crypto:Error signatureBytesResult = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
                if signatureBytesResult is crypto:Error {
                    http:InternalServerError err = {
                        headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                        body: {"error": "Token creation failed"}
                    };
                    return err;
                }
                string encodedSignature = signatureBytesResult.toBase64();
                string token = encodedPayload + "." + encodedSignature;
                
                // Extract profile picture if available
                string profilePicture = "";
                anydata pictureField = foundUser.profilePicture;
                if pictureField is string {
                    profilePicture = pictureField;
                }

                http:Ok okResponse = {
                    headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                    body: {
                        "status": "success",
                        "message": "Login successful",
                        "token": token,
                        "user": {
                            "id": userId,
                            "username": username,
                            "email": userEmail,
                            "role": userRole,
                            "isApproved": userIsApproved,
                            "profilePicture": profilePicture
                        }
                    }
                };
                return okResponse;
            }
        }
        
        http:BadRequest badRequest = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {"error": "Invalid action"}
        };
        return badRequest;
    }

    // Admin: List pending users
    resource function get admin/users/pending(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError {
        // AuthZ: require admin role
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Missing Authorization header"}};
            return unauth;
        }
        string authHeader = authHeaderResult;
        if !authHeader.startsWith("Bearer ") {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token format"}};
            return unauth;
        }
        string token = authHeader.substring("Bearer ".length());
        string secretKey = JWT_SECRET;

        int? dotIndex = token.indexOf(".");
        if dotIndex is () {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token"}};
            return unauth;
        }
        string encodedPayload = token.substring(0, dotIndex);
        string providedSignature = token.substring(dotIndex + 1);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes;
        if payloadBytesResult is byte[] {
            payloadBytes = payloadBytesResult;
        } else if payloadBytesResult is string {
            payloadBytes = payloadBytesResult.toBytes();
        } else {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token payload encoding"}};
            return unauth;
        }
        var signatureResult = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
        if signatureResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Token validation failed"}};
            return err;
        }
        string expectedSignature = signatureResult.toBase64();
        if providedSignature != expectedSignature {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token signature"}};
            return unauth;
        }

        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to convert token payload to string"}};
            return err;
        }
        string payloadString = payloadStringResult;
        var parseResult = payloadString.fromJsonString();
        if parseResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to parse token payload as JSON"}};
            return err;
        }
        json payloadJson = parseResult;
        string role = "";
        if payloadJson is map<json> {
            var tp = payloadJson.cloneWithType(TokenPayload);
            if tp is TokenPayload {
                role = tp.role;
            } else {
                json|error roleField = payloadJson["role"];
                if roleField is string {
                    role = roleField;
                } else if roleField is json {
                    role = roleField.toString();
                }
                
            }
        }
        string roleLower = role.trim().toLowerAscii();
        if roleLower != "admin" {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Forbidden"}};
            return unauth;
        }

        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }
        var collection = db->getCollection("users");
        if collection is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }

        // Query pattern adapted for handling multiple results from database
        json[] result = [];
        
        // Try to query all users first, then filter
        stream<record {|anydata...;|}, error?>|error allUsersQuery = collection->find({});
        if allUsersQuery is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Query failed"}};
            return err;
        }
        
        // Process each user document
        error? processError = allUsersQuery.forEach(function(record {|anydata...;|} user) {
            // Check if this user is pending (not approved)
            anydata approvedField = user["isApproved"];
            boolean isApproved = approvedField is boolean ? approvedField : true; // default to approved if field missing
            
            if !isApproved {
                // Extract user fields
                anydata usernameField = user["username"];
                anydata emailField = user["email"];
                anydata roleField = user["role"];
                
                string username = usernameField is string ? usernameField : "";
                string email = emailField is string ? emailField : "";
                string userRole = roleField is string ? roleField : "";
                
                if username != "" && email != "" && userRole != "" {
                    result.push({
                        "username": username,
                        "email": email,
                        "role": userRole,
                        "isApproved": isApproved
                    });
                    
                }
            }
        });
        
        if processError is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to process users"}};
            return err;
        }
        

        http:Ok ok = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: result};
        return ok;
    }

    // Admin: List all users
    resource function get admin/users/all(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError {
        // AuthZ: require admin role (reuse token validation logic)
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Missing Authorization header"}};
            return unauth;
        }
        string authHeader = authHeaderResult;
        if !authHeader.startsWith("Bearer ") {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token format"}};
            return unauth;
        }
        string token = authHeader.substring("Bearer ".length());
        string secretKey = JWT_SECRET;

        int? dotIndex = token.indexOf(".");
        if dotIndex is () {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token"}};
            return unauth;
        }
        string encodedPayload = token.substring(0, dotIndex);
        string providedSignature = token.substring(dotIndex + 1);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes;
        if payloadBytesResult is byte[] {
            payloadBytes = payloadBytesResult;
        } else if payloadBytesResult is string {
            payloadBytes = payloadBytesResult.toBytes();
        } else {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token payload encoding"}};
            return unauth;
        }
        var signatureResult = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
        if signatureResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Token validation failed"}};
            return err;
        }
        string expectedSignature = signatureResult.toBase64();
        if providedSignature != expectedSignature {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token signature"}};
            return unauth;
        }
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to convert token payload to string"}};
            return err;
        }
        string payloadString = payloadStringResult;
        var parseResult = payloadString.fromJsonString();
        if parseResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to parse token payload as JSON"}};
            return err;
        }
        json payloadJson = parseResult;
        string role = "";
        if payloadJson is map<json> {
            var tp = payloadJson.cloneWithType(TokenPayload);
            if tp is TokenPayload {
                role = tp.role;
            } else {
                json|error roleField = payloadJson["role"];
                if roleField is string {
                    role = roleField;
                } else if roleField is json {
                    role = roleField.toString();
                }
            }
        }
        string roleLower = role.trim().toLowerAscii();
        if roleLower != "admin" {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Forbidden"}};
            return unauth;
        }

        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }
        var collection = db->getCollection("users");
        if collection is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }

        json[] result = [];
        stream<record {|anydata...;|}, error?>|error allUsersQuery = collection->find({});
        if allUsersQuery is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Query failed"}};
            return err;
        }

        error? processError = allUsersQuery.forEach(function(record {|anydata...;|} userDoc) {
            anydata usernameField = userDoc["username"];
            anydata emailField = userDoc["email"];
            anydata roleField = userDoc["role"];
            anydata approvedField = userDoc["isApproved"];
            anydata firstNameField = userDoc["firstName"];
            anydata lastNameField = userDoc["lastName"];
            anydata phoneField = userDoc["phone"];
            anydata addressField = userDoc["address"];
            anydata createdAtField = userDoc["createdAt"];

            string username = usernameField is string ? usernameField : "";
            string email = emailField is string ? emailField : "";
            string userRole = roleField is string ? roleField : "";
            boolean isApproved = approvedField is boolean ? approvedField : true;

            if email != "" {
                map<json> userJson = {
                    "username": username,
                    "email": email,
                    "role": userRole,
                    "isApproved": isApproved
                };
                if firstNameField is string { userJson["firstName"] = firstNameField; }
                if lastNameField is string { userJson["lastName"] = lastNameField; }
                if phoneField is string { userJson["phone"] = phoneField; }
                if addressField is string { userJson["address"] = addressField; }
                if createdAtField is string { userJson["createdAt"] = createdAtField; }

                result.push(userJson);
            }
        });

        if processError is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to process users"}};
            return err;
        }

        http:Ok ok = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: result};
        return ok;
    }

    // Admin: Approve a user by email
    resource function post admin/users/approve(http:Request request) returns http:Ok|http:Unauthorized|http:BadRequest|http:InternalServerError {
        // AuthZ: require admin role (reuse logic)
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Missing Authorization header"}};
            return unauth;
        }
        string authHeader = authHeaderResult;
        if !authHeader.startsWith("Bearer ") {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token format"}};
            return unauth;
        }
        string token = authHeader.substring("Bearer ".length());
        string secretKey = JWT_SECRET;
        int? dotIndex = token.indexOf(".");
        if dotIndex is () {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token"}};
            return unauth;
        }
        string encodedPayload = token.substring(0, dotIndex);
        string providedSignature = token.substring(dotIndex + 1);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes;
        if payloadBytesResult is byte[] {
            payloadBytes = payloadBytesResult;
        } else if payloadBytesResult is string {
            payloadBytes = payloadBytesResult.toBytes();
        } else {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token payload encoding"}};
            return unauth;
        }
        var signatureResult = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
        if signatureResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Token validation failed"}};
            return err;
        }
        string expectedSignature = signatureResult.toBase64();
        if providedSignature != expectedSignature {
            io:println("[admin/users/approve] Invalid token signature");
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token signature"}};
            return unauth;
        }
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to convert token payload to string"}};
            return err;
        }
        string payloadString = payloadStringResult;
        io:println("[admin/users/approve] payloadString:", payloadString);
        var parseResult = payloadString.fromJsonString();
        if parseResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to parse token payload as JSON"}};
            return err;
        }
        json payloadJson = parseResult;
        string role = "";
        if payloadJson is map<json> {
            var tp = payloadJson.cloneWithType(TokenPayload);
            if tp is TokenPayload {
                role = tp.role;
                io:println("[admin/users/approve] role via TokenPayload:", role);
            } else {
                json|error roleField = payloadJson["role"];
                if roleField is string {
                    role = roleField;
                } else if roleField is json {
                    role = roleField.toString();
                }
                io:println("[admin/users/approve] role via raw field:", role);
            }
        }
        string roleLower = role.trim().toLowerAscii();
        if roleLower != "admin" {
            io:println("[admin/users/approve] Forbidden - role:", role, " roleLower:", roleLower);
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Forbidden"}};
            return unauth;
        }

        // Parse request body for email
        json|http:ClientError payload = request.getJsonPayload();
        if payload is http:ClientError {
            http:BadRequest bad = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid JSON payload"}};
            return bad;
        }
        json|error emailField = payload.email;
        if emailField is error || !(emailField is string) {
            http:BadRequest bad = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Missing or invalid email"}};
            return bad;
        }
        string email = <string>emailField;

        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }
        var collection = db->getCollection("users");
        if collection is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }

        // Add logging to debug the update operation
        io:println("[admin/users/approve] Attempting to approve user:", email);
        
        // First check if user exists
        record {|anydata...;|}|error|() userExists = collection->findOne({email: email});
        if userExists is error {
            io:println("[admin/users/approve] User lookup failed:", userExists.message());
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "User lookup failed"}};
            return err;
        }
        if userExists is () {
            io:println("[admin/users/approve] User not found:", email);
            http:BadRequest bad = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "User not found"}};
            return bad;
        }
        
        io:println("[admin/users/approve] User found, proceeding with update");
        
        // Try a different approach - delete and re-insert the user with updated status
        // First get the current user document
        record {|anydata...;|}|error|() currentUser = collection->findOne({email: email});
        if currentUser is record {|anydata...;|} {
            // Delete the current user
            var deleteRes = collection->deleteOne({email: email});
            if deleteRes is error {
                io:println("[admin/users/approve] Delete failed with error:", deleteRes.message());
                http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Delete failed: " + deleteRes.message()}};
                return err;
            }
            
            // Create a new document with isApproved set to true
            record {|anydata...;|} updatedUser = currentUser.clone();
            updatedUser["isApproved"] = true;
            
            // Insert the updated user
            var insertRes = collection->insertOne(updatedUser);
            if insertRes is error {
                io:println("[admin/users/approve] Insert failed with error:", insertRes.message());
                http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Insert failed: " + insertRes.message()}};
                return err;
            }
        } else {
            io:println("[admin/users/approve] Could not get user document for update");
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Could not retrieve user for update"}};
            return err;
        }
        
        io:println("[admin/users/approve] Update successful for:", email);
        http:Ok ok = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"status": "success", "message": "User approved successfully"}};
        return ok;
    }

    // Admin: Approve a user by path param (treats `id` as email for now)
    resource function post admin/users/approve/[string id](http:Request request) returns http:Ok|http:Unauthorized|http:BadRequest|http:InternalServerError {
        // AuthZ: require admin role (reuse logic)
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Missing Authorization header"}};
            return unauth;
        }
        string authHeader = authHeaderResult;
        if !authHeader.startsWith("Bearer ") {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token format"}};
            return unauth;
        }
        string token = authHeader.substring("Bearer ".length());
        string secretKey = JWT_SECRET;
        int? dotIndex = token.indexOf(".");
        if dotIndex is () {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token"}};
            return unauth;
        }
        string encodedPayload = token.substring(0, dotIndex);
        string providedSignature = token.substring(dotIndex + 1);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes;
        if payloadBytesResult is byte[] {
            payloadBytes = payloadBytesResult;
        } else if payloadBytesResult is string {
            payloadBytes = payloadBytesResult.toBytes();
        } else {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token payload encoding"}};
            return unauth;
        }
        var signatureResult = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
        if signatureResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Token validation failed"}};
            return err;
        }
        string expectedSignature = signatureResult.toBase64();
        if providedSignature != expectedSignature {
            io:println("[admin/users/approve/:id] Invalid token signature");
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token signature"}};
            return unauth;
        }
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to convert token payload to string"}};
            return err;
        }
        string payloadString = payloadStringResult;
        io:println("[admin/users/approve/:id] payloadString:", payloadString);
        var parseResult = payloadString.fromJsonString();
        if parseResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to parse token payload as JSON"}};
            return err;
        }
        json payloadJson = parseResult;
        string role = "";
        if payloadJson is map<json> {
            var tp = payloadJson.cloneWithType(TokenPayload);
            if tp is TokenPayload {
                role = tp.role;
                io:println("[admin/users/approve/:id] role via TokenPayload:", role);
            } else {
                json|error roleField = payloadJson["role"];
                if roleField is string {
                    role = roleField;
                } else if roleField is json {
                    role = roleField.toString();
                }
                io:println("[admin/users/approve/:id] role via raw field:", role);
            }
        }
        string roleLower = role.trim().toLowerAscii();
        if roleLower != "admin" {
            io:println("[admin/users/approve/:id] Forbidden - role:", role, " roleLower:", roleLower);
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Forbidden"}};
            return unauth;
        }

        // Use path param `id` as email identifier for approval
        string email = id;

        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }
        var collection = db->getCollection("users");
        if collection is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }

        // Add logging to debug the update operation
        io:println("[admin/users/approve/:id] Attempting to approve user:", email);
        
        // First check if user exists
        record {|anydata...;|}|error|() userExists = collection->findOne({email: email});
        if userExists is error {
            io:println("[admin/users/approve/:id] User lookup failed:", userExists.message());
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "User lookup failed"}};
            return err;
        }
        if userExists is () {
            io:println("[admin/users/approve/:id] User not found:", email);
            http:BadRequest bad = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "User not found"}};
            return bad;
        }
        
        io:println("[admin/users/approve/:id] User found, proceeding with update");
        
        // Try a different approach - delete and re-insert the user with updated status
        // First get the current user document
        record {|anydata...;|}|error|() currentUser = collection->findOne({email: email});
        if currentUser is record {|anydata...;|} {
            // Delete the current user
            var deleteRes = collection->deleteOne({email: email});
            if deleteRes is error {
                io:println("[admin/users/approve] Delete failed with error:", deleteRes.message());
                http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Delete failed: " + deleteRes.message()}};
                return err;
            }
            
            // Create a new document with isApproved set to true
            record {|anydata...;|} updatedUser = currentUser.clone();
            updatedUser["isApproved"] = true;
            
            // Insert the updated user
            var insertRes = collection->insertOne(updatedUser);
            if insertRes is error {
                io:println("[admin/users/approve] Insert failed with error:", insertRes.message());
                http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Insert failed: " + insertRes.message()}};
                return err;
            }
        } else {
            io:println("[admin/users/approve] Could not get user document for update");
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Could not retrieve user for update"}};
            return err;
        }
        
        io:println("[admin/users/approve/:id] Update successful for:", email);
        http:Ok ok = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"status": "success", "message": "User approved successfully"}};
        return ok;
    }
    
    // CORS for admin unapprove with path param
    resource function options admin/users/unapprove/[string id]() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    // Admin: Unapprove a user by path param (treats `id` as email)
    resource function post admin/users/unapprove/[string id](http:Request request) returns http:Ok|http:Unauthorized|http:BadRequest|http:InternalServerError {
        // AuthZ: require admin role (reuse logic similar to approve)
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Missing Authorization header"}};
            return unauth;
        }
        string authHeader = authHeaderResult;
        if !authHeader.startsWith("Bearer ") {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token format"}};
            return unauth;
        }
        string token = authHeader.substring("Bearer ".length());
        string secretKey = JWT_SECRET;
        int? dotIndex = token.indexOf(".");
        if dotIndex is () {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token"}};
            return unauth;
        }
        string encodedPayload = token.substring(0, dotIndex);
        string providedSignature = token.substring(dotIndex + 1);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes;
        if payloadBytesResult is byte[] {
            payloadBytes = payloadBytesResult;
        } else if payloadBytesResult is string {
            payloadBytes = payloadBytesResult.toBytes();
        } else {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token payload encoding"}};
            return unauth;
        }
        var signatureResult = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
        if signatureResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Token validation failed"}};
            return err;
        }
        string expectedSignature = signatureResult.toBase64();
        if providedSignature != expectedSignature {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token signature"}};
            return unauth;
        }
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to convert token payload to string"}};
            return err;
        }
        string payloadString = payloadStringResult;
        var parseResult = payloadString.fromJsonString();
        if parseResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to parse token payload as JSON"}};
            return err;
        }
        json payloadJson = parseResult;
        string role = "";
        if payloadJson is map<json> {
            var tp = payloadJson.cloneWithType(TokenPayload);
            if tp is TokenPayload {
                role = tp.role;
            } else {
                json|error roleField = payloadJson["role"];
                if roleField is string {
                    role = roleField;
                } else if roleField is json {
                    role = roleField.toString();
                }
            }
        }
        string roleLower = role.trim().toLowerAscii();
        if roleLower != "admin" {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Forbidden"}};
            return unauth;
        }

        string email = id;
        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }
        var collection = db->getCollection("users");
        if collection is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }

        // Load, modify isApproved=false via delete+insert workaround
        record {|anydata...;|}|error|() currentUser = collection->findOne({email: email});
        if currentUser is () {
            http:BadRequest bad = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "User not found"}};
            return bad;
        }
        if currentUser is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "User lookup failed"}};
            return err;
        }

        record {|anydata...;|} updatedUser = currentUser.clone();
        updatedUser["isApproved"] = false;
        var delRes = collection->deleteOne({email: email});
        if delRes is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Update failed (delete)"}};
            return err;
        }
        var insRes = collection->insertOne(updatedUser);
        if insRes is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Update failed (insert)"}};
            return err;
        }

        http:Ok ok = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"status": "success", "message": "User unapproved successfully"}};
        return ok;
    }

    // CORS for admin delete by id (email)
    resource function options admin/users/[string id]() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    // Admin: Delete a user by email
    resource function delete admin/users/[string id](http:Request request) returns http:Ok|http:Unauthorized|http:BadRequest|http:InternalServerError {
        // AuthZ: require admin role
        string|error authHeaderResult = request.getHeader("Authorization");
        if authHeaderResult is error {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Missing Authorization header"}};
            return unauth;
        }
        string authHeader = authHeaderResult;
        if !authHeader.startsWith("Bearer ") {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token format"}};
            return unauth;
        }
        string token = authHeader.substring("Bearer ".length());
        string secretKey = JWT_SECRET;
        int? dotIndex = token.indexOf(".");
        if dotIndex is () {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token"}};
            return unauth;
        }
        string encodedPayload = token.substring(0, dotIndex);
        string providedSignature = token.substring(dotIndex + 1);
        var payloadBytesResult = mime:base64Decode(encodedPayload);
        byte[] payloadBytes;
        if payloadBytesResult is byte[] {
            payloadBytes = payloadBytesResult;
        } else if payloadBytesResult is string {
            payloadBytes = payloadBytesResult.toBytes();
        } else {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token payload encoding"}};
            return unauth;
        }
        var signatureResult = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
        if signatureResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Token validation failed"}};
            return err;
        }
        string expectedSignature = signatureResult.toBase64();
        if providedSignature != expectedSignature {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Invalid token signature"}};
            return unauth;
        }
        string|error payloadStringResult = string:fromBytes(payloadBytes);
        if payloadStringResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to convert token payload to string"}};
            return err;
        }
        string payloadString = payloadStringResult;
        var parseResult = payloadString.fromJsonString();
        if parseResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Failed to parse token payload as JSON"}};
            return err;
        }
        json payloadJson = parseResult;
        string role = "";
        if payloadJson is map<json> {
            var tp = payloadJson.cloneWithType(TokenPayload);
            if tp is TokenPayload {
                role = tp.role;
            } else {
                json|error roleField = payloadJson["role"];
                if roleField is string {
                    role = roleField;
                } else if roleField is json {
                    role = roleField.toString();
                }
            }
        }
        string roleLower = role.trim().toLowerAscii();
        if roleLower != "admin" {
            http:Unauthorized unauth = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Forbidden"}};
            return unauth;
        }

        string targetEmail = id;
        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }
        var usersCollection = db->getCollection("users");
        if usersCollection is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "DB error"}};
            return err;
        }

        // Delete user by email
        var deleteResult = usersCollection->deleteOne({"email": targetEmail});
        if deleteResult is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"error": "Account deletion failed"}};
            return err;
        }

        // Best-effort cascade delete of places added by this user
        var placesCollectionOrError = db->getCollection("places");
        if !(placesCollectionOrError is error) {
            var placesCollection = placesCollectionOrError;
            var delPlaces = placesCollection->deleteMany({"addedBy": targetEmail});
            if delPlaces is error {
                // ignore
            }
        }

        http:Ok ok = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, body: {"status": "success", "message": "User deleted successfully"}};
        return ok;
    }

    // Add this new function inside your 'service' block in main.bal
    resource function post places(http:Request request) returns http:Created|http:Unauthorized|http:InternalServerError|http:BadRequest {
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
        io:println("Token validated. Adding new place: ", placeData.name);
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
        string|error payloadStringResult = string:fromBytes(payloadBytes);
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

    // CORS for profile routes
    resource function options profile() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    resource function options profile/upload() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    resource function options profile/password() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    resource function options profile/activity() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    // Get user profile
    resource function get profile(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError {
        string|http:Unauthorized tokenValidation = validateToken(request);
        if tokenValidation is http:Unauthorized {
            return tokenValidation;
        }
        string userId = tokenValidation; // now email

        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }
        var collection = db->getCollection("users");
        if collection is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }

        // Since token 'sub' now carries the email, find by email
        record {|anydata...;|}|error|() userQuery = collection->findOne({"email": userId});
        if userQuery is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "User lookup failed"}
            };
            return err;
        }
        if userQuery is () {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "User not found"}
            };
            return err;
        }

        record {|anydata...;|} user = userQuery;
        
        // Extract user data safely
        anydata idField = user["_id"] ?: "";
        anydata usernameField = user["username"] ?: "";
        anydata emailField = user["email"] ?: "";
        anydata roleField = user["role"] ?: "";
        anydata phoneField = user["phoneNumber"] ?: "";
        anydata addressField = user["address"] ?: "";
        anydata pictureField = user["profilePicture"] ?: "";
        anydata disabilitiesField = user["disabilities"] ?: [];
        anydata traitsField = user["traits"] ?: [];
        anydata approvedField = user["isApproved"] ?: false;

        json userProfile = {
            "id": idField.toString(),
            "username": usernameField.toString(),
            "email": emailField.toString(),
            "role": roleField.toString(),
            "phoneNumber": phoneField.toString(),
            "address": addressField.toString(),
            "profilePicture": pictureField.toString(),
            "disabilities": disabilitiesField is json ? disabilitiesField : [],
            "traits": traitsField is json ? traitsField : [],
            "isApproved": approvedField is json ? approvedField : false
        };

        http:Ok ok = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: userProfile
        };
        return ok;
    }

    // Update user profile
    resource function put profile(http:Request request) returns http:Ok|http:Unauthorized|http:BadRequest|http:InternalServerError {
        string|http:Unauthorized tokenValidation = validateToken(request);
        if tokenValidation is http:Unauthorized {
            return tokenValidation;
        }
        string userId = tokenValidation; // now email

        json|http:ClientError payload = request.getJsonPayload();
        if payload is http:ClientError {
            http:BadRequest badRequest = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Invalid JSON payload"}
            };
            return badRequest;
        }

        ProfileUpdateData|error profileData = payload.cloneWithType(ProfileUpdateData);
        if profileData is error {
            http:BadRequest badRequest = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Invalid profile data"}
            };
            return badRequest;
        }

        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }
        var collection = db->getCollection("users");
        if collection is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }

        // Build update document
        map<json> updateFields = {};
        if profileData.username is string {
            updateFields["username"] = profileData.username;
        }
        if profileData.phoneNumber is string {
            updateFields["phoneNumber"] = profileData.phoneNumber;
        }
        if profileData.address is string {
            updateFields["address"] = profileData.address;
        }
        if profileData.profilePicture is string {
            updateFields["profilePicture"] = profileData.profilePicture;
        }

        // Prevent empty update which may fail in Mongo
        if updateFields.length() == 0 {
            http:BadRequest badRequest = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "No valid fields provided to update"}
            };
            return badRequest;
        }

        io:println("[PUT /profile] Updating user (email): ", userId, " with fields: ", updateFields.toString());

        // Workaround for update modifier issues: delete and re-insert updated document
        record {|anydata...;|}|error|() currentUser = collection->findOne({"email": userId});
        if currentUser is error || currentUser is () {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Could not load current user for update"}
            };
            return err;
        }

        record {|anydata...;|} updatedUser = currentUser.clone();
        foreach var [k, v] in updateFields.entries() {
            updatedUser[k] = v;
        }

        var delRes = collection->deleteOne({"email": userId});
        if delRes is error {
            io:println("[PUT /profile] Delete failed: ", delRes.message());
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Profile update failed (delete)"}
            };
            return err;
        }

        var insRes = collection->insertOne(updatedUser);
        if insRes is error {
            io:println("[PUT /profile] Insert failed: ", insRes.message());
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Profile update failed (insert)"}
            };
            return err;
        }

        http:Ok ok = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {"status": "success", "message": "Profile updated successfully"}
        };
        return ok;
    }

    // Change password
    resource function put profile/password(http:Request request) returns http:Ok|http:Unauthorized|http:BadRequest|http:InternalServerError {
        string|http:Unauthorized tokenValidation = validateToken(request);
        if tokenValidation is http:Unauthorized {
            return tokenValidation;
        }
        string userId = tokenValidation; // now email

        json|http:ClientError payload = request.getJsonPayload();
        if payload is http:ClientError {
            http:BadRequest badRequest = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Invalid JSON payload"}
            };
            return badRequest;
        }

        PasswordChangeData|error passwordData = payload.cloneWithType(PasswordChangeData);
        if passwordData is error {
            http:BadRequest badRequest = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Invalid password data"}
            };
            return badRequest;
        }

        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }
        var collection = db->getCollection("users");
        if collection is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }

        // Get current user to verify current password
        record {|anydata...;|}|error|() userQuery = collection->findOne({"email": userId});
        if userQuery is error || userQuery is () {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "User not found"}
            };
            return err;
        }

        record {|anydata...;|} user = userQuery;
        string storedPasswordHash = user["password_hash"].toString();
        string currentPasswordHash = crypto:hashSha256(passwordData.currentPassword.toBytes()).toBase64();

        if currentPasswordHash != storedPasswordHash {
            http:BadRequest badRequest = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Current password is incorrect"}
            };
            return badRequest;
        }

        // Hash new password and update
        string newPasswordHash = crypto:hashSha256(passwordData.newPassword.toBytes()).toBase64();
        // Workaround: update by delete + insert
        record {|anydata...;|}|error|() currentUser2 = collection->findOne({"email": userId});
        if currentUser2 is error || currentUser2 is () {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "User not found"}
            };
            return err;
        }
        record {|anydata...;|} updatedUser2 = currentUser2.clone();
        updatedUser2["password_hash"] = newPasswordHash;
        var delRes2 = collection->deleteOne({"email": userId});
        if delRes2 is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Password update failed (delete)"}
            };
            return err;
        }
        var insRes2 = collection->insertOne(updatedUser2);
        if insRes2 is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Password update failed (insert)"}
            };
            return err;
        }

        http:Ok ok = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {"status": "success", "message": "Password updated successfully"}
        };
        return ok;
    }

    // Get user activity history
    resource function get profile/activity(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError {
        string|http:Unauthorized tokenValidation = validateToken(request);
        if tokenValidation is http:Unauthorized {
            return tokenValidation;
        }
        string userId = tokenValidation;

        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }
        var placesCollection = db->getCollection("places");
        if placesCollection is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }
        // Places collection obtained above; we'll avoid nested lookups in stream closures
        var reviewsCollection = db->getCollection("reviews");
        if reviewsCollection is error {
            // If reviews collection is not available, continue with empty reviews
        }

        // Get places added by user
        json[] placesAdded = [];
        stream<record {|anydata...;|}, error?>|error placesQuery = placesCollection->find({"addedBy": userId});
        if placesQuery is stream<record {|anydata...;|}, error?> {
            error? foreachResult = placesQuery.forEach(function(record {|anydata...;|} place) {
                anydata idField = place["_id"] ?: "";
                anydata nameField = place["name"] ?: "";
                anydata locationField = place["location"] ?: "";
                anydata rampField = place["hasRamp"] ?: false;
                anydata restroomField = place["hasAccessibleRestroom"] ?: false;
                
                json placeJson = {
                    "id": idField.toString(),
                    "name": nameField.toString(),
                    "location": locationField.toString(),
                    "hasRamp": rampField is json ? rampField : false,
                    "hasAccessibleRestroom": restroomField is json ? restroomField : false
                };
                placesAdded.push(placeJson);
            });
            if foreachResult is error {
                // Ignore processing error for activity; return what we have
            }
        }

        // Get reviews added by user (by email from token subject)
        json[] reviewsAdded = [];
        if reviewsCollection is mongodb:Collection {
            stream<record {|anydata...;|}, error?>|error reviewsQuery = reviewsCollection->find({"userEmail": userId});
            if reviewsQuery is stream<record {|anydata...;|}, error?> {
                error? fe2 = reviewsQuery.forEach(function(record {|anydata...;|} review) {
                    anydata idField = review["reviewId"] ?: review["_id"] ?: "";
                    anydata placeIdField = review["placeId"] ?: "";
                    anydata ratingField = review["rating"] ?: 0;
                    anydata commentField = review["comment"] ?: "";
                    anydata createdAtField = review["createdAt"] ?: "";

                    json reviewJson = {
                        "id": idField.toString(),
                        "placeId": placeIdField.toString(),
                        "rating": ratingField is int ? ratingField : 0,
                        "comment": commentField.toString(),
                        "createdAt": createdAtField.toString()
                    };
                    reviewsAdded.push(reviewJson);
                });
                if fe2 is error {
                    // Ignore processing error for activity; return what we have
                }
            }
        }

        // Enrich reviews with place names by querying places collection per review
        mongodb:Collection placesCollForLookup = checkpanic db->getCollection("places");
        json[] reviewsWithNames = [];
        foreach var r in reviewsAdded {
            string rid = "";
            string rpid = "";
            int ratingVal = 0;
            string commentVal = "";
            string createdAtVal = "";
            if r is map<json> {
                json|error f1 = r["id"]; if f1 is string { rid = f1; } else if f1 is json { rid = f1.toString(); }
                json|error f2 = r["placeId"]; if f2 is string { rpid = f2; } else if f2 is json { rpid = f2.toString(); }
                json|error f3 = r["rating"]; if f3 is int { ratingVal = f3; }
                json|error f4 = r["comment"]; if f4 is string { commentVal = f4; } else if f4 is json { commentVal = f4.toString(); }
                json|error f5 = r["createdAt"]; if f5 is string { createdAtVal = f5; } else if f5 is json { createdAtVal = f5.toString(); }
            }
            string placeNameVal = "";
            if rpid != "" {
                record {|anydata...;|}|error|() placeDoc2 = placesCollForLookup->findOne({"placeId": rpid});
                if placeDoc2 is record {|anydata...;|} {
                    anydata nameField3 = placeDoc2["name"] ?: "";
                    placeNameVal = nameField3.toString();
                }
            }
            json rr = {
                "id": rid,
                "placeId": rpid,
                "placeName": placeNameVal,
                "rating": ratingVal,
                "comment": commentVal,
                "createdAt": createdAtVal
            };
            reviewsWithNames.push(rr);
        }

        json activity = {
            "placesAdded": placesAdded,
            "reviewsAdded": reviewsWithNames
        };

        http:Ok ok = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: activity
        };
        return ok;
    }

    // Upload profile picture (expects JSON { file: dataUrl, fileName?: string })
    resource function post profile/upload(http:Request request) returns http:Ok|http:Unauthorized|http:BadRequest|http:InternalServerError {
        string|http:Unauthorized tokenValidation = validateToken(request);
        if tokenValidation is http:Unauthorized {
            return tokenValidation;
        }
        string userEmail = tokenValidation; // token sub

        json|http:ClientError payload = request.getJsonPayload();
        if payload is http:ClientError {
            http:BadRequest bad = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Invalid JSON"}};
            return bad;
        }
        json|error fileField = payload.file;
        if fileField is error || !(fileField is string) {
            http:BadRequest bad = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Missing file (base64 data URL)"}};
            return bad;
        }
        string dataUrl = <string>fileField;
        string fileName = "profile.jpg";
        json|error nameField = payload.fileName;
        if nameField is string { fileName = nameField; }

        // Upload to Cloudinary
        string|error imageUrl = uploadImageToCloudinary(dataUrl, fileName);
        if imageUrl is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": imageUrl.message()}};
            return err;
        }

        // Save URL to user's profile
        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "DB error"}};
            return err;
        }
        var collection = db->getCollection("users");
        if collection is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "DB error"}};
            return err;
        }
        // Workaround update
        record {|anydata...;|}|error|() currentUser = collection->findOne({"email": userEmail});
        if currentUser is error || currentUser is () {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "User not found"}};
            return err;
        }
        record {|anydata...;|} updatedUser = currentUser.clone();
        updatedUser["profilePicture"] = imageUrl;
        var delRes = collection->deleteOne({"email": userEmail});
        if delRes is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Update failed (delete)"}};
            return err;
        }
        var insRes = collection->insertOne(updatedUser);
        if insRes is error {
            http:InternalServerError err = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"error": "Update failed (insert)"}};
            return err;
        }

        http:Ok ok = {headers: {"Access-Control-Allow-Origin": "http://localhost:5173"}, body: {"status": "success", "url": imageUrl}};
        return ok;
    }

    // Delete user account
    resource function delete profile(http:Request request) returns http:Ok|http:Unauthorized|http:InternalServerError {
        string|http:Unauthorized tokenValidation = validateToken(request);
        if tokenValidation is http:Unauthorized {
            return tokenValidation;
        }
        string userId = tokenValidation; // now email

        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }
        var usersCollection = db->getCollection("users");
        if usersCollection is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }

        // Delete user account by email (token subject is email)
        var deleteResult = usersCollection->deleteOne({"email": userId});
        if deleteResult is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Account deletion failed"}
            };
            return err;
        }

        // Also delete user's places and any other related data
        var placesCollectionOrError = db->getCollection("places");
        if placesCollectionOrError is error {
            // Skip cascade if places collection is unavailable
        } else {
            var placesCollection = placesCollectionOrError;
            // Best-effort cascade delete of places added by this user
            var delPlaces = placesCollection->deleteMany({"addedBy": userId});
            if delPlaces is error {
                // Ignore delete error; user account deletion already succeeded
            }
        }
        // TODO: Delete profile picture from Cloudinary if exists

        http:Ok ok = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {"status": "success", "message": "Account deleted successfully"}
        };
        return ok;
    }

    // CORS for caregiver suggestions
    resource function options caregivers/suggest() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    // Suggest caregivers based on PWD traits
    resource function post caregivers/suggest(http:Request request) returns http:Ok|http:Unauthorized|http:BadRequest|http:InternalServerError {
        // Validate token and ensure user is a PWD
        string|http:Unauthorized userIdOrErr = validateToken(request);
        if userIdOrErr is http:Unauthorized { return userIdOrErr; }

        // Get user details to check role and traits
        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }
        
        var usersCollection = db->getCollection("users");
        if usersCollection is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }

        // Get current user to check role and disabilities
        record {|anydata...;|}|error|() currentUser = usersCollection->findOne({"email": userIdOrErr});
        if currentUser is error || currentUser is () {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "User not found"}
            };
            return err;
        }

        record {|anydata...;|} user = currentUser;
        
        // Check if user is a PWD
        anydata roleField = user["role"];
        string userRole = roleField is string ? roleField : "";
        if userRole.trim().toLowerAscii() != "pwd" {
            http:BadRequest bad = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Only persons with disabilities can request caregiver suggestions"}
            };
            return bad;
        }

        // Get user's disabilities
        anydata disabilitiesField = user["disabilities"];
        string[] userDisabilities = [];
        if disabilitiesField is json {
            if disabilitiesField is string[] {
                userDisabilities = disabilitiesField;
            } else if disabilitiesField is json[] {
                foreach var item in disabilitiesField {
                    if item is string {
                        userDisabilities.push(item);
                    }
                }
            }
        }

        if userDisabilities.length() == 0 {
            http:BadRequest bad = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "No disabilities found for user. Please update your profile with your disabilities."}
            };
            return bad;
        }

        // Define the mapping from disabilities to caregiver traits
        map<string[]> disabilityToTraitMapping = {
            "Wheelchair user": ["Skilled in wheelchair handling"],
            "Limited mobility": ["Trained in safe lifting/transfers"],
            "Low vision": ["Experienced in sighted guiding"],
            "Blind": ["Familiar with braille/tactile support"],
            "Hard of hearing": ["Experienced in non-verbal communication"],
            "Deaf": ["Proficient in sign language"],
            "Cognitive challenges": ["Skilled in simplifying instructions"],
            "Autism spectrum needs": ["Trained in autism support"],
            "Chronic pain": ["Knowledge of chronic condition support"],
            "Respiratory issues": ["First aid & CPR certified"]
        };

        // Case-insensitive canonicalization for disabilities
        map<string> disabilityCanonical = {
            "wheelchair user": "Wheelchair user",
            "limited mobility": "Limited mobility",
            "low vision": "Low vision",
            "blind": "Blind",
            "hard of hearing": "Hard of hearing",
            "deaf": "Deaf",
            "cognitive challenges": "Cognitive challenges",
            "autism spectrum needs": "Autism spectrum needs",
            "chronic pain": "Chronic pain",
            "respiratory issues": "Respiratory issues"
        };

        // Find matching traits based on user's disabilities (case-insensitive)
        string[] requiredTraits = [];
        string[] requiredTraitsNorm = [];
        foreach string disability in userDisabilities {
            string keyLc = disability.trim().toLowerAscii();
            string? canonicalKey = disabilityCanonical[keyLc];
            if canonicalKey is string {
                string[]? matchingTraits = disabilityToTraitMapping[canonicalKey];
                if matchingTraits is string[] {
                    foreach string trait in matchingTraits {
                        string traitNorm = trait.trim().toLowerAscii();
                        boolean found = false;
                        foreach string existingTrait in requiredTraitsNorm {
                            if existingTrait == traitNorm { found = true; break; }
                        }
                        if !found {
                            requiredTraits.push(trait);
                            requiredTraitsNorm.push(traitNorm);
                        }
                    }
                }
            }
        }

        if requiredTraits.length() == 0 {
            http:BadRequest bad = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "No matching caregiver traits found for your disabilities"}
            };
            return bad;
        }

        // Find caregivers with matching traits
        json[] suggestedCaregivers = [];
        stream<record {|anydata...;|}, error?>|error caregiversQuery = usersCollection->find({
            "role": "caregiver"
        });
        
        if caregiversQuery is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Failed to query caregivers"}
            };
            return err;
        }

        error? processError = caregiversQuery.forEach(function(record {|anydata...;|} caregiver) {
            // Extract caregiver traits with robust fallbacks (accept arrays or single string)
            string[] caregiverTraits = [];
            anydata traitsField = caregiver["traits"];

            if traitsField is string[] {
                caregiverTraits = traitsField;
            } else if traitsField is json[] {
                foreach var item in traitsField {
                    if item is string { caregiverTraits.push(item); }
                }
            } else if traitsField is anydata[] {
                foreach var item in traitsField {
                    if item is string { caregiverTraits.push(item); }
                }
            } else if traitsField is string {
                caregiverTraits.push(traitsField);
            }

            // Fallback: some documents might use alternative field names like "skills" or "caregiverTraits"
            if caregiverTraits.length() == 0 {
                anydata skillsField = caregiver["skills"] ?: caregiver["caregiverTraits"] ?: ();
                if skillsField is string[] {
                    caregiverTraits = skillsField;
                } else if skillsField is json[] {
                    foreach var it in skillsField { if it is string { caregiverTraits.push(it); } }
                } else if skillsField is anydata[] {
                    foreach var it in skillsField { if it is string { caregiverTraits.push(it); } }
                } else if skillsField is string {
                    caregiverTraits.push(skillsField);
                }
            }

            // Calculate match score based on required traits
            int matchScore = 0;
            string[] matchingTraits = [];
            foreach string requiredTrait in requiredTraits {
                boolean found = false;
                string requiredTraitNorm = requiredTrait.trim().toLowerAscii();
                foreach string caregiverTrait in caregiverTraits {
                    if caregiverTrait.trim().toLowerAscii() == requiredTraitNorm {
                        found = true;
                        break;
                    }
                }
                if found {
                    matchScore += 1;
                    matchingTraits.push(requiredTrait);
                }
            }

            // Include all caregivers; frontend will perform filtering
            // Extract caregiver details
            anydata usernameField = caregiver["username"];
            anydata emailField = caregiver["email"];
            anydata phoneField = caregiver["phoneNumber"];
            anydata addressField = caregiver["address"];
            anydata pictureField = caregiver["profilePicture"];
            anydata idField = caregiver["_id"];

            string username = usernameField is string ? usernameField : "";
            string email = emailField is string ? emailField : "";
            string phone = phoneField is string ? phoneField : "";
            string address = addressField is string ? addressField : "";
            string picture = pictureField is string ? pictureField : "";
            string id = idField is string ? idField : idField.toString();

            json caregiverJson = {
                "id": id,
                "username": username,
                "email": email,
                "phoneNumber": phone,
                "address": address,
                "profilePicture": picture,
                "traits": caregiverTraits,
                "matchScore": matchScore,
                "matchingTraits": matchingTraits,
                "matchPercentage": matchScore * 100 / requiredTraits.length()
            };
            suggestedCaregivers.push(caregiverJson);
        });

        if processError is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Failed to process caregivers"}
            };
            return err;
        }

        // Note: Caregivers are already added in order of processing
        // For better sorting, the frontend can sort by matchScore

        http:Ok ok = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {
                "suggestedCaregivers": suggestedCaregivers,
                "userDisabilities": userDisabilities,
                "requiredTraits": requiredTraits,
                "totalFound": suggestedCaregivers.length()
            }
        };
        return ok;
    }

    // CORS for disabled suggestions
    resource function options disabled/suggest() returns http:Ok {
        http:Ok okResponse = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
        return okResponse;
    }

    // Suggest PWDs for caregivers based on caregiver traits
    resource function post disabled/suggest(http:Request request) returns http:Ok|http:Unauthorized|http:BadRequest|http:InternalServerError {
        // Validate token and ensure user is a caregiver
        string|http:Unauthorized userIdOrErr = validateToken(request);
        if userIdOrErr is http:Unauthorized { return userIdOrErr; }

        // Get user details to check role and traits
        var db = mongoClient->getDatabase("accessable");
        if db is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }

        var usersCollection = db->getCollection("users");
        if usersCollection is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "DB error"}
            };
            return err;
        }

        // Get current user to check role and traits
        record {|anydata...;|}|error|() currentUser = usersCollection->findOne({"email": userIdOrErr});
        if currentUser is error || currentUser is () {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "User not found"}
            };
            return err;
        }

        record {|anydata...;|} user = currentUser;

        // Check if user is a caregiver
        anydata roleField = user["role"];
        string userRole = roleField is string ? roleField : "";
        if userRole.trim().toLowerAscii() != "caregiver" {
            http:BadRequest bad = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Only caregivers can request disabled suggestions"}
            };
            return bad;
        }

        // Get caregiver traits
        anydata traitsField = user["traits"];
        string[] caregiverTraits = [];
        if traitsField is json {
            if traitsField is string[] {
                caregiverTraits = traitsField;
            } else if traitsField is json[] {
                foreach var item in traitsField {
                    if item is string {
                        caregiverTraits.push(item);
                    }
                }
            }
        }

        if caregiverTraits.length() == 0 {
            http:BadRequest bad = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "No skills found for caregiver. Please update your profile with your skills."}
            };
            return bad;
        }

        // Define the mapping from caregiver traits to PWD disabilities
        map<string[]> traitToDisabilityMapping = {
            "Skilled in wheelchair handling": ["Wheelchair user"],
            "Trained in safe lifting/transfers": ["Limited mobility"],
            "Experienced in sighted guiding": ["Low vision"],
            "Familiar with braille/tactile support": ["Blind"],
            "Experienced in non-verbal communication": ["Hard of hearing"],
            "Proficient in sign language": ["Deaf"],
            "Skilled in simplifying instructions": ["Cognitive challenges"],
            "Trained in autism support": ["Autism spectrum needs"],
            "Knowledge of chronic condition support": ["Chronic pain"],
            "First aid & CPR certified": ["Respiratory issues"]
        };

        // Case-insensitive canonicalization for traits and disabilities
        map<string> traitCanonical = {
            "skilled in wheelchair handling": "Skilled in wheelchair handling",
            "trained in safe lifting/transfers": "Trained in safe lifting/transfers",
            "experienced in sighted guiding": "Experienced in sighted guiding",
            "familiar with braille/tactile support": "Familiar with braille/tactile support",
            "experienced in non-verbal communication": "Experienced in non-verbal communication",
            "proficient in sign language": "Proficient in sign language",
            "skilled in simplifying instructions": "Skilled in simplifying instructions",
            "trained in autism support": "Trained in autism support",
            "knowledge of chronic condition support": "Knowledge of chronic condition support",
            "first aid & cpr certified": "First aid & CPR certified"
        };
        map<string> disabilityCanonical2 = {
            "wheelchair user": "Wheelchair user",
            "limited mobility": "Limited mobility",
            "low vision": "Low vision",
            "blind": "Blind",
            "hard of hearing": "Hard of hearing",
            "deaf": "Deaf",
            "cognitive challenges": "Cognitive challenges",
            "autism spectrum needs": "Autism spectrum needs",
            "chronic pain": "Chronic pain",
            "respiratory issues": "Respiratory issues"
        };

        // Find target disabilities based on caregiver's traits
        string[] targetDisabilities = [];
        foreach string trait in caregiverTraits {
            string traitKey = trait.trim().toLowerAscii();
            string lookupKey = trait;
            var tcanon = traitCanonical[traitKey];
            if tcanon is string { lookupKey = tcanon; }
            string[]? matches = traitToDisabilityMapping[lookupKey];
            if matches is string[] {
                foreach string cond in matches {
                    string condKey = cond.trim().toLowerAscii();
                    string condCanonical2 = cond;
                    var dcanon = disabilityCanonical2[condKey];
                    if dcanon is string { condCanonical2 = dcanon; }
                    boolean exists = false;
                    foreach string existing in targetDisabilities {
                        if existing == condCanonical2 { exists = true; break; }
                    }
                    if !exists { targetDisabilities.push(condCanonical2); }
                }
            }
        }

        if targetDisabilities.length() == 0 {
            http:BadRequest bad = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "No matching disabilities found for your skills"}
            };
            return bad;
        }

        // Find PWD users with matching disabilities
        json[] suggestedDisabled = [];
        stream<record {|anydata...;|}, error?>|error disabledQuery = usersCollection->find({
            "role": "pwd"
        });

        if disabledQuery is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Failed to query users"}
            };
            return err;
        }

        error? processError = disabledQuery.forEach(function(record {|anydata...;|} dUser) {
            // Extract disabilities with robust fallbacks
            string[] disabilities = [];
            anydata disabilitiesField2 = dUser["disabilities"];
            if disabilitiesField2 is string[] {
                disabilities = disabilitiesField2;
            } else if disabilitiesField2 is json[] {
                foreach var item in disabilitiesField2 { if item is string { disabilities.push(item); } }
            } else if disabilitiesField2 is anydata[] {
                foreach var item in disabilitiesField2 { if item is string { disabilities.push(item); } }
            } else if disabilitiesField2 is string {
                disabilities.push(disabilitiesField2);
            }

            // Calculate match score
            int matchScore = 0;
            string[] matchingDisabilities = [];
            foreach string cond in targetDisabilities {
                boolean found = false;
                string condNorm = cond.trim().toLowerAscii();
                foreach string userCond in disabilities {
                    if userCond.trim().toLowerAscii() == condNorm { found = true; break; }
                }
                if found { matchScore += 1; matchingDisabilities.push(cond); }
            }

            // Include all PWD users; frontend will perform filtering
            anydata usernameField = dUser["username"];
            anydata emailField = dUser["email"];
            anydata phoneField = dUser["phoneNumber"];
            anydata addressField = dUser["address"];
            anydata pictureField = dUser["profilePicture"];
            anydata idField = dUser["_id"];

            string username = usernameField is string ? usernameField : "";
            string email = emailField is string ? emailField : "";
            string phone = phoneField is string ? phoneField : "";
            string address = addressField is string ? addressField : "";
            string picture = pictureField is string ? pictureField : "";
            string id = idField is string ? idField : idField.toString();

            json disabledJson = {
                "id": id,
                "username": username,
                "email": email,
                "phoneNumber": phone,
                "address": address,
                "profilePicture": picture,
                "disabilities": disabilities,
                "matchScore": matchScore,
                "matchingDisabilities": matchingDisabilities,
                "matchPercentage": matchScore * 100 / targetDisabilities.length()
            };
            suggestedDisabled.push(disabledJson);
        });

        if processError is error {
            http:InternalServerError err = {
                headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
                body: {"error": "Failed to process users"}
            };
            return err;
        }

        http:Ok ok = {
            headers: {"Access-Control-Allow-Origin": "http://localhost:5173"},
            body: {
                "suggestedDisabled": suggestedDisabled,
                "caregiverTraits": caregiverTraits,
                "targetDisabilities": targetDisabilities,
                "totalFound": suggestedDisabled.length()
            }
        };
        return ok;
    }
}