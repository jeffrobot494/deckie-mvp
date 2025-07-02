name: "Export to Table Top Simulator" feature for deckie.tcg

brief description: Tabletop Simulator reads decks from .png or .jpg files where each card in the deck is a composite image in a grid that forms the whole image. This feature will export the selected deck as an image file compatible with Tabletop Simulator.

complete description: 
Tabletop Simulator reads the image as a 10x7 grid, so that's the number of cells in our grid. The maximum size of the output image is 4096x4096. The sheet can't contain more than 70 cells/cards, so any more than that in our deck won't be added to the image. We add card images to cells from left to right and top to bottom. If there are less than 70 cards in the deck, the remaining cells are filled white.

There is an "Export to TTS" button in the deckbuilder. When this button is clicked, the names of the cards in the deck are sent to the server, the server grabs them from cloudinary, builds the gridded deck image, uploads that to cloudinary, returns the url to the client, then the client downloads the deck image from cloudinary. the deck image is saved in the database under the deckie_url for the deckbuilder. 

We need to create a new database table to hold these deck_image urls. 

There are two files in this directory which you should read which may help you build the grid creation functionality. 