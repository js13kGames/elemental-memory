var Game = function() {


    // CONSTANTS


    var TRAY_WIDTH = 6,
        TRAY_HEIGHT = 3,
        NUMBER_OF_PAIRS = TRAY_WIDTH * TRAY_HEIGHT / 2,
        PAIR_SHOWING_TIME = 1000, //time interval for the player to see the pair
        DEFAULT_CARD_URL = 'svg/starofdavid.svg',
        TWITTER_LINK = 'https://twitter.com/intent/tweet/?text=',
        TWITTER_TEXT = 'I just finished Elemental Memory in ',
        BADGE_ID_ATTR = 'pair-id',
        TURNED_UP_ATTR = 'turned-up',
        AWAY_ATTR = 'away'



    // GAME-RELATED


    var firstCard,
        remainingPairs,
        tray = document.getElementById('tray'),
        tweetCard,
        time,
        timeCard,
        timeCardSpan,
        timeInterval,
        gameBlocked



    // PRIVATE


    function init() {

        firstCard = null
        remainingPairs = NUMBER_OF_PAIRS
        time = 0
        gameBlocked = true
        tweetCard = null
        timeCard = null

        prepareCards()

    }


    function buildTray(finalCards) {

        //the time card:
        timeCard = createButtonCardOnTray('0s', 'Elapsed Time', null, 'card-main rotated counter')
        timeCardSpan = timeCard.getElementsByTagName('span')[0]

        setTimeout(function() { //500ms for the time card to appear

            for (var i = 0, l = finalCards.length, c; i < l ;) {

                // line breaks...
                if (i > 0 && i % TRAY_WIDTH == 0) {
                    tray.appendChild(document.createElement('br'))
                }

                // card itself
                var card = finalCards[i]

                createCardOnTray(card, 'card-main', null, i++, cardClicked)

            }

            setTimeout(function() { //after all the cards appeared...

                gameBlocked = false

                timeInterval = setInterval(function() {
                    timeCardSpan.innerText = (++time).toTimeString()
                }, 1000)

            }, 200 * l)

        }, 500)

    }


    function createCardOnTray(card, classes, extraSpan, randomOriginOrder, clickEventListener) {

        function addRandomOriginToCard(cardElement, randomOriginOrder) {
            // origin position
            cardElement.style.transform = 'translate({0}px, {1}px) rotate({3}deg)'
                .replace('{0}', Math.random() * 1280 - 640)
                .replace('{1}', 1024)
                .replace('{3}', Math.random() * 720 - 360)
            cardElement.style.webkitTransform = cardElement.style.transform //Safari needs this one :)

            // final position
            setTimeout(function() {
                cardElement.style.transform = 'translate({0}px, {1}px) rotate({3}deg)'
                    .replace('{0}', Math.random() * 3 - 1.5)
                    .replace('{1}', Math.random() * 8 - 4)
                    .replace('{3}', Math.random() * 4 - 2)
                cardElement.style.webkitTransform = cardElement.style.transform
            }, 200 * (randomOriginOrder+1) )
        }

        var cardElement = document.createElement('div'),
            frontElement = document.createElement('div'),
            backElement = document.createElement('div')

        if (card.id) cardElement.setAttribute(BADGE_ID_ATTR, card.id)
        cardElement.className = classes
        cardElement.addEventListener('click', clickEventListener)
        if (randomOriginOrder !== null) addRandomOriginToCard(cardElement, randomOriginOrder) //extracted for readability

        if (card.img) frontElement.style.backgroundImage = card.img
        if (card.title) frontElement.innerHTML = card.title
        frontElement.className = 'face front'
        if (extraSpan) frontElement.appendChild(extraSpan)

        if (card.composite) frontElement.style.backgroundPositionY = '10%, 90%'

        backElement.style.backgroundImage = 'url(' + DEFAULT_CARD_URL + ')'
        backElement.className = 'face back'

        cardElement.appendChild(frontElement)
        cardElement.appendChild(backElement)
        tray.appendChild(cardElement)

        return cardElement
    }


    function createButtonCardOnTray(text, customTitle, eventListener, customClasses) {

        var initTextSpan = document.createElement('span')
        initTextSpan.innerText = text

        var card = {
            title: customTitle || 'Elemental Memory'
        }

        var button = createCardOnTray(card, customClasses || 'card-main rotated', initTextSpan, null, eventListener)

        button.setAttribute(TURNED_UP_ATTR, 'true')
        button.setAttribute(AWAY_ATTR, 'true')

        setTimeout(function() { //after appending...
            button.removeAttribute(AWAY_ATTR) //make it appear
        }, 100)

        return button
    }


    function createInfoCardOnTray(text, title) {
        return createButtonCardOnTray(text, title, null, 'card-main info')
    }


    function turnCard(el) {
        if (el.getAttribute(TURNED_UP_ATTR)) {
            el.removeAttribute(TURNED_UP_ATTR)
        } else {
            el.setAttribute(TURNED_UP_ATTR, 'true')
        }
    }


    function cardClicked(e) {

        if (this.getAttribute(TURNED_UP_ATTR) || gameBlocked) return

        turnCard(this)

        if (!firstCard) {

            firstCard = this

        } else {

            if (this.getAttribute(BADGE_ID_ATTR) == firstCard.getAttribute(BADGE_ID_ATTR)) {

                remainingPairs--

                if (!remainingPairs) {
                    setTimeout(gameFinished, 700) //time for the card to turn up completely
                }

            } else {

                //this and firstCard will be gone when the time comes,
                //so, create references :)
                var latestCardRef = this,
                    firstCardRef = firstCard

                //time interval for the player to see the pair
                gameBlocked = true
                setTimeout(function() {
                    turnCard(latestCardRef)
                    turnCard(firstCardRef)
                    gameBlocked = false
                }, PAIR_SHOWING_TIME)

            }

            firstCard = null

        }

    }


    function hideLoading(callback) {
        loadingCard.setAttribute(AWAY_ATTR, 'true')
        setTimeout(function() {
            tray.removeChild(loadingCard)
            callback()
        }, 500)
    }


    function gameFinished() {

        clearInterval(timeInterval)

        //remove cards (animation and removal)

        for (var i = 1, l = tray.children.length; i < l ;) {

            (function(i) {
                var cardElement = tray.children[i]
                setTimeout(function() {
                    cardElement.style.transform = 'translate({0}px, {1}px) rotate({3}deg)'
                        .replace('{0}', Math.random() * 1280 - 640)
                        .replace('{1}', 1024)
                        .replace('{3}', Math.random() * 720 - 360)
                    cardElement.style.webkitTransform = cardElement.style.transform //Safari needs this one :)
                }, 200 * i)
            }(i++))

        }

        //after animations...
        setTimeout(function() {

            //actual removal from the DOM

            while (tray.children.length > 1) //dont remove the time card :D
                tray.removeChild(tray.lastChild)

            //show twitter and "play again" buttons/cards

            tweetCard = createButtonCardOnTray('Tweet!', 'Share your time', function() {
                window.location = TWITTER_LINK +
                    encodeURIComponent(TWITTER_TEXT) +
                    time.toTimeString()
            })

            tray.appendChild(document.createElement('br'))

            setTimeout(function() {
                Game.createInitButton(null, 'Play Again')
            }, 600)

        }, 200 * i + 700) //this is the 'i' from the first for!

    }

    function prepareCards() {

        var symbols = [
                'fire',
                'air',
                'earth',
                'water'
            ],
            finalCards = [],
            i = 0
        while (i < NUMBER_OF_PAIRS) {

            var myItem = {
                img: i < 4 ? ('url(svg/' + symbols[i] + '.svg)') : function() {

                    var result
                    do {
                        result = 'url(svg/' + symbols.getRandomItem(false) + '.svg), ' +
                            'url(svg/' + symbols.getRandomItem(false) + '.svg)'
                    } while (function() {
                        for (var i2 = 0, l = finalCards.length; i2 < l ;) {
                            if (finalCards[i2++].img == result) {
                                //console.log('avoided repeated')
                                return true
                            }
                        }
                        return false
                    }())
                    return result
                }(),
                title: i < 4 ? symbols[i] : '',
                composite: !(i < 4),
                id: i++
            }

            finalCards.push(myItem)
            finalCards.push(myItem)

        }

        finalCards.shuffle()

        buildTray(finalCards)

    }


    // PUBLIC


    return {

        createInitButton: function(event, customTitle) {

            var buttonRef = createButtonCardOnTray(customTitle || 'Start', ' ', function() {

                this.setAttribute(AWAY_ATTR, 'true')

                if (tweetCard) tweetCard.setAttribute(AWAY_ATTR, 'true')
                if (timeCard) timeCard.setAttribute(AWAY_ATTR, 'true')

                setTimeout(function() {

                    while (tray.hasChildNodes())
                        tray.removeChild(tray.lastChild)

                    init();

                }, 500)

            })

        }

    }
}()

// Prototype Helpers

Array.prototype.getRandomItem = function (deleteAfter) {
    var index = Math.floor(Math.random() * this.length),
        item = this[index]

    if (deleteAfter) this.splice(index, 1)

    return item
}
Array.prototype.shuffle = function() {
    for (var j, x, i = this.length; i ;) {
        j = Math.floor(Math.random() * i)
        x = this[--i]
        this[i] = this[j]
        this[j] = x
    }
}
Number.prototype.toTimeString = function() {
    var mins = Math.floor(this / 60),
        secs = this % 60
    return (mins ? mins + 'm' : '') + secs + 's'
}


// Starting...

window.addEventListener('load', Game.createInitButton)
