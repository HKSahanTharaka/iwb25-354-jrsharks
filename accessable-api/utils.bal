import ballerina/crypto;
import ballerina/mime;
import ballerina/io;
import ballerina/os;

public function signTokenPayload(byte[] payloadBytes, string secretKey) returns string|error {
    byte[]|crypto:Error sig = crypto:hmacSha256(payloadBytes, secretKey.toBytes());
    if sig is crypto:Error {
        return sig;
    }
    return sig.toBase64();
}

public function splitAndDecodeToken(string token) returns [byte[], string]|error {
    int? dotIndex = token.indexOf(".");
    if dotIndex is () {
        return error("invalid_token");
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
        return error("invalid_payload");
    }
    return [payloadBytes, providedSignature];
}


// --- Configuration helpers ---

final map<string> DOT_ENV = loadDotEnv();

function loadDotEnv() returns map<string> {
    map<string> values = {};
    string[]|io:Error linesResult = io:fileReadLines(".env");
    if linesResult is string[] {
        foreach string rawLine in linesResult {
            string line = rawLine.trim();
            if line.length() == 0 || line.startsWith("#") {
                continue;
            }
            int? eqIndex = line.indexOf("=");
            if eqIndex is () {
                continue;
            }
            string key = line.substring(0, eqIndex).trim();
            string value = line.substring(eqIndex + 1).trim();
            if value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2 {
                value = value.substring(1, value.length() - 1);
            } else if value.startsWith("'") && value.endsWith("'") && value.length() >= 2 {
                value = value.substring(1, value.length() - 1);
            }
            values[key] = value;
        }
    }
    return values;
}

public function getConfig(string key, string defaultValue = "") returns string {
    string? envValue = os:getEnv(key);
    if envValue is string && envValue.trim().length() > 0 {
        return envValue.trim();
    }
    string? fileValue = DOT_ENV[key];
    if fileValue is string && fileValue.trim().length() > 0 {
        return fileValue.trim();
    }
    return defaultValue;
}

public final string JWT_SECRET = getConfig("JWT_SECRET", "dev-insecure-jwt-secret");

