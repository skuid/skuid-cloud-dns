class CustomError extends Error {
	constructor(message) {
		super(message);
		this.message = message;
		this.name = this.constructor.name;
	}
}

module.exports = CustomError;