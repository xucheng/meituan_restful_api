/**
 * @author helloworldjerry@gmail.com
 */
module.exports={
	host : process.env.MYSQL_HOST || 'localhost',
	user : process.env.MYSQL_USER || 'root',
	password : process.env.MYSQL_PASSWORD || '',
	port : process.env.MYSQL_PORT || 3306,
	database : process.env.MYSQL_DATABASE || 'meituan'
}
