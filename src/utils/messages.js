const generatedMessage = (username, text) => {
    return {
        username, 
        text, 
        createdAt: new Date().getTime()
    }
}

const generatedLocMessage = (username, url) => {
    return {
        username, 
        url, 
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generatedMessage,
    generatedLocMessage

}
