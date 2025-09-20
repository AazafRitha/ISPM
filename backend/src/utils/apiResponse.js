export class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode
    };
  }

  static error(message = 'Error', statusCode = 500, data = null) {
    return {
      success: false,
      message,
      data,
      statusCode
    };
  }
}
