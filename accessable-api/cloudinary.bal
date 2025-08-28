import ballerina/http;
import ballerina/crypto;
import ballerina/time;
import ballerina/io;
import ballerina/url;

// Cloudinary configuration - read from environment/.env
public final string CLOUDINARY_CLOUD_NAME = getConfig("CLOUDINARY_CLOUD_NAME");
public final string CLOUDINARY_API_KEY = getConfig("CLOUDINARY_API_KEY");
public final string CLOUDINARY_API_SECRET = getConfig("CLOUDINARY_API_SECRET");

// Upload image to Cloudinary using signed upload with base64 data URL
public function uploadImageToCloudinary(string fileBase64DataUrl, string fileName) returns string|error {
    int timestamp = time:utcNow()[0];

    // Params to sign
    string paramsToSign = "timestamp=" + timestamp.toString();

    // Cloudinary signature: SHA1 of (paramsToSign + API_SECRET)
    byte[] sigBytes = crypto:hashSha1((paramsToSign + CLOUDINARY_API_SECRET).toBytes());
    string signature = sigBytes.toBase16();

    // Create form-encoded body (url:encode requires charset param)
    string encodedFile = check url:encode(fileBase64DataUrl, "UTF-8");
    string body = "file=" + encodedFile +
                  "&api_key=" + CLOUDINARY_API_KEY +
                  "&timestamp=" + timestamp.toString() +
                  "&signature=" + signature;

    http:Client cloudinaryClient = check new ("https://api.cloudinary.com");
    http:Response|error res = cloudinaryClient->post(
        "/v1_1/" + CLOUDINARY_CLOUD_NAME + "/image/upload",
        body,
        {"Content-Type": "application/x-www-form-urlencoded"}
    );

    if res is error {
        return res;
    }
    if res.statusCode != 200 {
        string errPayload = check res.getTextPayload();
        io:println("Cloudinary upload failed: ", errPayload);
        return error("Cloudinary upload failed: " + errPayload);
    }

    json|http:ClientError jsonPayload = res.getJsonPayload();
    if jsonPayload is http:ClientError {
        return error("Invalid Cloudinary response");
    }
    json payload = jsonPayload;

    if payload is map<json> {
        json|error urlField = payload["secure_url"];
        if urlField is string {
            return urlField;
        } else if urlField is json {
            return urlField.toString();
        }
    }
    return error("secure_url not found in Cloudinary response");
}

public function deleteImageFromCloudinary(string publicId) returns error? {
    // Generate timestamp
    int timestamp = time:utcNow()[0];
    
    // Create parameters for signing
    string paramsToSign = "public_id=" + publicId + "&timestamp=" + timestamp.toString();
    
    // Generate signature (HMAC-SHA1)
    byte[]|crypto:Error signatureBytes = crypto:hmacSha1(
        paramsToSign.toBytes(), 
        CLOUDINARY_API_SECRET.toBytes()
    );
    if signatureBytes is crypto:Error {
        return signatureBytes;
    }
    string signature = signatureBytes.toBase16();
    
    // Create HTTP client
    http:Client cloudinaryClient = check new ("https://api.cloudinary.com");
    
    // Create form data
    string formData = "api_key=" + CLOUDINARY_API_KEY + 
                     "&timestamp=" + timestamp.toString() + 
                     "&public_id=" + publicId + 
                     "&signature=" + signature;
    
    // Make the API call
    http:Response response = check cloudinaryClient->post(
        "/v1_1/" + CLOUDINARY_CLOUD_NAME + "/image/destroy", 
        formData, 
        {"Content-Type": "application/x-www-form-urlencoded"}
    );
    
    if response.statusCode != 200 {
        string errorMsg = check response.getTextPayload();
        io:println("Cloudinary delete failed with status: ", response.statusCode, " Message: ", errorMsg);
        return error("Cloudinary delete failed: " + errorMsg);
    }
}
