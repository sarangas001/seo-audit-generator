const { resource } = require("../app");


const getSEOData = async (req, res) => {
    try {

        const {name, email, whatsAppNum, websiteUrl, mainKeywords, location} = req.body;

        // 

    }catch (error) {
        return resource.json({
            message: "Error fetching SEO data",
            status: false,
            error: error.message
        });
    }
}