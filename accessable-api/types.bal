import ballerina/io;
import ballerinax/mongodb;

public type User record {|
    string _id?;
    string username;
    string email;
    string password_hash;
    string role;
    boolean isApproved;
    string[] disabilities?;
    string[] traits?;
    // Profile fields
    string phoneNumber?;
    string address?;
    string profilePicture?; // Cloudinary URL
|};

public type RegistrationData record {|
    string username;
    string email;
    string password;
    string role;
    string[] disabilities?;
    string[] traits?;
|};

public type LoginData record {|
    string email;
    string password;
|};

public type Place record {|
    string _id?;
    string name;
    string location;
    string addedBy;
    boolean hasRamp;
    boolean hasAccessibleRestroom;
|};

public type TokenPayload record {|
    string sub;
    string issuer;
    string role;
    boolean isApproved;
|};

// Profile update data
public type ProfileUpdateData record {|
    string? username;
    string? phoneNumber;
    string? address;
    string? profilePicture;
|};

// Password change data
public type PasswordChangeData record {|
    string currentPassword;
    string newPassword;
|};

// Activity history types
public type UserActivity record {|
    Place[] placesAdded;
    // Reviews will be added when review system is implemented
|};

// MongoDB configuration - use environment variable for security
public function getMongoUri() returns string {
    string uri = getConfig("MONGODB_URI");
    if uri.trim().length() == 0 {
        io:println("⚠️  WARNING: MONGODB_URI is not set. Please configure it in your environment or .env file.");
    }
    return uri;
}

public final string MONGO_URI = getMongoUri();
public final mongodb:Client MONGO_CLIENT = checkpanic new ({connection: MONGO_URI});


