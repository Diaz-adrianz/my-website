const pop = document.getElementById("sfx-pop")
const pop2 = document.getElementById("sfx-pop2")
const poperror = document.getElementById("sfx-poperror")
const teng = document.getElementById("sfx-teng")

const lang = {}
let this_lang = "in"

// WELCOME PROMPT
const welcome = alert("Selamat datang! Terima kasih telah bersedia berkunjung di website saya. Perlu diketahu beberapa konten dalam website ini masih bersifat sementara/tempelan, tetapi suatu saat akan berubah seiring perkembangan saya.\n\nBest regards, Diaz.")


// GET CLIENT VIEW 
function getView () {
    let view = document.querySelector('body')
    return [view.offsetWidth, view.offsetHeight];
}

// SVG STYLING COLOR 
function path_ () {
    let path = document.querySelectorAll("path")
    let circle = document.querySelectorAll("circle")

    path.forEach( p => {
        if ( p.getAttribute("fill") == "#6c63ff") {
            p.classList.add("svg-accent")
        }
    })

    circle.forEach( c => {
        if ( c.getAttribute("fill") == "#6c63ff") {
            c.classList.add("svg-accent")
        }
    })
}
// GREETING 
function getTime () {
    const currentTime = new Date
    let hour = currentTime.getHours().toString()

    let greet = document.getElementById('greet')
    let currentGreet = '';

    if ( 0 <= hour && hour <= 10) {
        currentGreet = ( this_lang == "in" ? "Selamat pagi" : "Good Morning")
    } else if ( 11 <= hour && hour <= 14) {
        currentGreet = ( this_lang == "in" ? "Selamat Siang" : "Good Afternoon")
    } else {
        currentGreet = ( this_lang == "in" ? "Selamat Sore" : "Good Evening")
    }
    
    greet.textContent = currentGreet

}

getTime()
setInterval(() => {
    getTime()
}, 60000);

// CUSTOM THiS PAGE 
function open_settings (  event, el ) {
    event.stopPropagation()
    let target = el.nextElementSibling
    el.classList.toggle("focus")
    target.classList.add("show")

    window.onclick = e => {
        if ( e.target != target || e.target != el ) {
            el.classList.remove("focus")
            fadeOut( target )
        }
    }
    pop2.play() 
}

function ui_mode ( event, el ) {
    event.stopPropagation()
    let icon = el.firstElementChild.firstElementChild 

    el.classList.toggle("on")
    icon.textContent = ( el.classList.contains("on") ? "dark_mode" : "light_mode")

    document.querySelector("body").classList.toggle("light")

    pop2.play() 
}

function lang_mode ( event, el ) {
    event.stopPropagation()

    let lang_el = document.querySelectorAll(".lang")

    el.classList.toggle("on")
    this_lang = ( el.classList.contains("on") ? "en" : "in" )

    if ( lang_el.length != 0 ) {
        lang_el.forEach( item => {
            if ( item.dataset.en ) {
                let nem = item.dataset.en
                let curr = item.textContent

                item.textContent = nem
                item.dataset.en = curr
            } else {
                let nem = item.dataset.content
                let curr = item.innerHTML
         
                item.innerHTML = lang[nem]
                lang[nem] = curr
            }
        })
    }

    getTime()
    pop2.play() 
}

// HEADER & NAVIGATION 
const medsos = document.querySelector("header .medsos")
const nav = document.querySelector('nav')
const nav_items = document.querySelectorAll('nav > .btn')

nav_items.forEach( item => {
    item.addEventListener("click", () => {

        let target = item.textContent.toLowerCase()
        let el_target = document.getElementById(target)

        swipe_layout( target, item)

        if ( !el_target.classList.contains("loaded")) {
            let needdata = document.querySelectorAll(`#${target} .need-data`)
                
            if ( needdata ) {
                get_Content( needdata, target )
            }
        }

        el_target.classList.add("loaded")
        fadeOut( document.querySelector(`#${target} > .load`), 3000)


        nav_items.forEach( n => n.classList.remove('active'))
        item.classList.add("active")

        item.textContent == "Home" ? 
        fadeOut(medsos) :
        medsos.classList.add("show") 

        path_()
    })
})

function swipe_layout( val, btn ) {
    let items = document.querySelectorAll(".page")
    let slide = items[0].parentElement
    let swipe_val = 100 / items.length
    let i = 0;

    items.forEach( item => {
        item.classList.remove("focus")

        if ( item.getAttribute('id') == val ) {

            item.classList.add("focus")

            slide.style.transform = `translateX(-${100 * i}%)`
            nav.style.transform = `translateX(-${swipe_val * i}%)`
        }
        i++
    })
}

// GET JSON CONTENT ASYNC 
async function get_Content ( data, parent ) {
    let content = await fetch(`content/datas.json`)
                        .then( res => res.json() )
                        .then( data => data[0] )

    data.forEach( dat => {
        let req = dat.dataset.type
        let nem = dat.dataset.content
        let tree = content[req][nem]
        switch ( req ) {
            case "text":
                dat.innerHTML = ( this_lang == "in" ? tree["in"] : tree["en"] )
                lang[nem] = ( this_lang == "in" ? tree["en"] : tree["in"] )
                break
            case "crsl":
                dat.innerHTML = crsl_template( tree )
                break
            case "pics":
                dat.innerHTML = pics_template( tree , parent, nem )
                break
            case "img":
                dat.setAttribute( "src", `img/${tree}`)
                break
            case "boxes":
                dat.innerHTML = boxes_template( tree )
                break
            case "people": 
                dat.innerHTML = chat_template( tree, "done", nem )
                break
            case "card": 
                dat.innerHTML = card_j_template( tree, nem )
                break
        }
    })

    setTimeout( () => teng.play(), 2200)

    tooltips(); up_crslMeter(); boxes_hover(); spy_section()
}

// <<<<< functional component >>>>>
// -------------------------------

// CAROUSEL
let crsl_meters = {
    pictures: 1,
    topWorks: 1
}

function up_crslMeter () {
    const meters = document.querySelectorAll(".crsl-meter")
    meters.forEach( m => {
        let parent = m.parentElement.previousElementSibling
        let child = parent.firstElementChild.children
        let on = m.dataset.meter

        m.textContent = `${crsl_meters[on]}/${child.length}`
    })
}

function crsl( el ) {
    let target_id = el.dataset.target
    let target_type = document.getElementById(target_id)

    if ( !target_type.classList.contains("crsl") ) return

    let on = el.parentElement.lastElementChild
    let current = parseInt( on.textContent[0] )

    let slider = document.querySelector(`#${target_id} .crsl-in > div`)
    let items = slider.children
    let item = items[current - 1].getBoundingClientRect().width
    let range = parseFloat((slider.style.transform).slice(11, -2))

    console.log(item)
    if ( el.dataset.nav == "next" ) {
        if ( range > item * ( items.length - 1) * -1) {
            slider.style.transform = `translateX(${range - item}px)`
            crsl_meters[on.dataset.meter]++
        } else {
            slider.style.transform = `translateX(0px)`
            crsl_meters[on.dataset.meter] = 1
        }      
    } else if ( el.dataset.nav == "prev" ) {
        if ( range < 0 ) {
            slider.style.transform = `translateX(${range + item}px)`
            crsl_meters[on.dataset.meter]--
        }
    }
    up_crslMeter()
}

// COLLAPSE CARD ( journey page )
function card_expand ( btn ) {
    let p = btn.previousElementSibling.classList

    p.toggle("show")
    btn.textContent = ( p.contains("show") ? "Hide" : "More" ) 
}

// OPEN / VIEW MODAL IMAGE 
function see_img( event, el ) {
    event.stopPropagation()
    
    let parent = el.dataset.parent
    let scrolling = document.querySelector(`#${parent} .flexing`)
    let bd = document.querySelector(`#${parent} .backdrop`)

    el.classList.contains("focus") ? 
    closeImg( el, bd, scrolling ) :
    openImg( el, bd, scrolling )    
    
    bd.onclick = Event => {
    closeImg( el, bd, scrolling )
    return
    }
}

function closeImg( el, backdrop, scrolling ) {
    el.classList.remove("focus")
    el.style.left = "0"
    el.style.top = "0"
    
    scrolling.dataset.scroll = "true"
    fadeOut(backdrop)
}

function openImg ( el, backdrop, scrolling ) {
    el.classList.add("focus")

    backdrop.classList.add("show")
    scrolling.dataset.scroll = "false"

    setTimeout( () => {
        let rect = el.getBoundingClientRect()

        el.style.cssText = `
        left: ${(getView()[0] / 2 ) - (rect.width / 2 ) - rect.left }px; 
        top: ${(getView()[1] / 2 ) - (rect.height / 2 ) - rect.top }px;
        `
    }, 300)
}

// FORM CONTROL 
const sheet = "https://script.google.com/macros/s/AKfycbzWzRKOKIXO7SNu4uhFhN1wr3ZF4mploJc2Bk2SnuR7vyNs9lakVmCr5otxBl6cOice/exec"
const sheet_id = "AKfycbzWzRKOKIXO7SNu4uhFhN1wr3ZF4mploJc2Bk2SnuR7vyNs9lakVmCr5otxBl6cOice"

const form = document.forms["send-message"]
const formInput = document.querySelectorAll(".f-input")
const formBtn = document.querySelector("form #form-send-btn")

let clientt = {
    nama: "",
    email: "",
    pesan: "",
    role: "client",
    img: "thumb.png",
    send: false,
    chance: 2,
    error: "Maaf pengiriman pesan sudah mencapai batas :(<br>(Sorry the sending of messages has reached the limit)"
}

form.onsubmit = Event => {
    Event.preventDefault()

    const chats = document.querySelector("#contact .flexing")
    const chat_me = document.querySelector("#contact .chat-me")

    let chat = ""

    if ( clientt["chance"] == 0 ) {
        let err_message = [{
            'img': "haha.jpg",
            'nama': "Diaz",
            'role': "author",
            'p': clientt['error'],
            'type': "" 
        }]
        chat = chat_template( err_message, "done", "noen"  ) 
        poperror.play()
        form_reset()
    } else {
        let this_client = [{
            'img': "thumb.png",
            'nama': clientt['nama'],
            'role': clientt['role'],
            'p': clientt['pesan'],
            'type': "chat-right" 
        }]
        console.log(this_client)
        chat = chat_template( this_client, "", "noen" )
    }

    chat_me.innerHTML += chat
    
    chats.scrollTop = chat_me.offsetHeight - chat_me.lastElementChild.offsetHeight

    if ( clientt["chance"] == 0) return

    fetch(sheet, { method: 'POST', body: new FormData(form)})
    .then(response => {
        pop.play()

        chat_me.lastElementChild.children[1]
        .lastElementChild.lastElementChild
        .classList.add("done")

        form_reset()
        
        formBtn.classList.add("disabled")
        clientt["chance"]--

        console.log('Success!', response)
    })
    .catch(error => console.error('Error!', error.message))

    
}

formInput.forEach( f => {
    f.addEventListener("keyup", () => {
        
        let name = f.getAttribute("name")
        let val = f.value

        if ( name == "email" ) val = checkEmail(f, val)
        
        clientt[name] = val
    
        if ( clientt["nama"] != "" && clientt["email"] != "" && clientt["pesan"] != "")
        {
            formBtn.classList.remove("disabled")
            clientt["send"] = true
        } else {
            formBtn.classList.add("disabled")
            clientt["send"] = false
        }

    })
})

function form_reset () {
    formInput.forEach( i => {
        i.value = ""
        clientt[i.getAttribute("name")] = ""
    })
}

function checkEmail ( el, val ) {
    let len = val.length

    if ( val.includes("@") && val[ len -1 ] != "@" || len == 0) {
        el.classList.remove("invalid")
        return val

    } else {
        el.classList.add("invalid")
        return ""
    }      
}
// <<<< animation / styling componennt >>>>
// ---------------------------------------

// BOXES HOVERING ( service page ) 
function boxes_hover() {
    let items = document.querySelectorAll("#service .grid figure")
    items.forEach( item => {
        let span = item.lastElementChild 
    
        item.onmouseover = () =>  span.style.height = ( span.textContent == "soon" ? "50%" : span.textContent)
        item.onmouseleave = () => span.style.height = "0"
        
    })
}

// FADE OUT ANIMATION 
function fadeOut ( el, duration = 400 ) {
    el.style.animationName = "fadeout"
    
    setTimeout( () => {
        el.style.animationName = "fade"
        el.classList.remove("show")
    }, duration)
}

// SPY ON SCROLL ANIMATION
spy_section()

function spy_section() {
    const spyable = document.querySelectorAll(".spy")
    spyable.forEach( spy => {
        let content = [...spy.children].filter( i => i.classList.contains("content"))
        let section = [...content[0].children].filter( i => i.tagName == "SECTION")
    
        section.forEach( item => {
            item.addEventListener("click", () => {
                section.forEach( i => i.classList.remove("focus"))
                item.classList.add("focus")
            })
        })

        if ( content.length > 0) {
            spy.addEventListener("scroll", () => {
                spying( spy, section )
            })
        }

    })
}

function spying ( parent, arrs ) {

    arrs.forEach( arr => {
        let rect = arr.getBoundingClientRect()

        if ( ( rect.top - arr.offsetHeight ) < 0  ) {
            clear_focus()
            arr.classList.add("focus")
        } else if ( parent.scrollTop < 10 ) {
            clear_focus()
            arrs[0].classList.add("focus")
        } else if ( parent.offsetHeight + parent.scrollTop >= parent.scrollHeight ) {
            clear_focus()
            arrs[arrs.length - 1].classList.add("focus")
        } 
    })

    function clear_focus () {
        arrs.forEach( i => i.classList.remove("focus"))
    }
}

// TOOLTIP HOVER
tooltips()

function tooltips () {
    const tooltips = document.querySelectorAll(".tooltip")

    tooltips.forEach( tooltip => {
        let t = tooltip.style
        let title = tooltip.dataset.title
        let plus = [20, 25]
    
        if ( tooltip.dataset.plus ) {
            plus = [0, -10 ]
        }
        tooltip.onmouseover = Event => {
            tooltip.classList.add('show')
        }
        tooltip.onmousemove = Event => {
                let x = Event.clientX - tooltip.getBoundingClientRect().left - plus[0]
                let y = Event.clientY - tooltip.getBoundingClientRect().top + plus[1]
        
                t.setProperty("--content", `'${title}'`)
                t.setProperty("--top", `${y}px`)
                t.setProperty("--left", `${x}px`)
        }
        tooltip.onmouseleave = Event => {
            t.setProperty("--animation-name", "fadeout")
        
            setTimeout( () => {
                t.setProperty("--animation-name", "fade")
                tooltip.classList.remove("show")
            }, 350)
        }
    })
}


// <<<<< template component >>>>
// -----------------------------

// CAROUSEL ITEM
function crsl_template ( items ) {
    let val = ""

    items.forEach( item => {
        val += `
        <div>
            <figure class="see-img tooltip" data-title="${item.title}">
                <img src="img/${item.file}" alt="">
            </figure>
        </div>
        `
    })
    return val;
}

// GRID PICTURE
function pics_template ( items, parent, key ) {
    let val = ""
    
    let i = 0
    items.forEach( item => {
        let p = ( this_lang == "in" ? item.p.in : item.p.en )
        lang[`${key}-${i}`] = ( this_lang == "in" ? item.p.en : item.p.in )

        val += `
        <div class="item see-img" onclick="see_img( event, this )" data-parent="${parent}">
            <figure>
                <img src="img/${item.img}" alt="${item.img}">
            </figure>
            <div>
                <a href="${item.link}" target="_blank">
                    <i class="material-icons">link</i>
                    <h3>${item.title}</h3>
                </a>
                <p class="lang" data-content="${key}-${i}">
                    ${p}
                </p>
            </div>
        </div>
        `
        i++
    })
    return val
}

// GRID BOX
function boxes_template( items ) {
    let val = ""
    items.forEach( item => {
        val += `
        <div class="item">
            <figure>
                <i class="${item.icon}" style="color: ${item.color};"></i>
                ${item.percentage}
            </figure>
            <p>${item.p}</p>
        </div>
        `
    })

    return val;
}

// JOOURNEY CARD 
function card_j_template ( items, key ) {
    let val = ""

    let i = 0
    items.forEach( item => {
        let title = ( this_lang == "in" ? item.title.in : item.title.en )
        lang[`${key}-t-${i}`] = ( this_lang == "in" ? item.title.en : item.title.in )

        let p = ( this_lang == "in" ? item.p.in : item.p.en )
        lang[`${key}-p-${i}`] = ( this_lang == "in" ? item.p.en : item.p.in )

        val += `
        <section class="card-j ${ items.indexOf(item) == 0 ? "focus" : "" }">
            <span>${ item.date }</span>
            <h3 class="lang" data-content="${key}-t-${i}">${ title }</h3>
            <p class="lang" data-content="${key}-p-${i}">
                ${ p }    
            </p>
            <button class="btn" onclick="card_expand(this)">More</button>
        </section>
        `
        i++
    })

    return val
}

// CHAT BOX
function chat_template ( items, status = "done", key = "author" ) {
    let val = ""
    
    let translate = "lang"
    let nem = ""
    let p;
    let i = 1
    items.forEach( item => {    
        if ( key != "noen" || key == undefined ) {
            p = ( this_lang == "in" ? item.p.in : item.p.en )
            nem = key + i.toString()
            lang[nem] = ( this_lang == "in" ? item.p.en : item.p.in )
        } else {
            p = item.p
            translate = ""
        }
        
        val += `
        <div class="chat ${item.type}">
            <figure>
                <img src="img/${ item.img }">
            </figure>
            <div>
                <h3>${item.nama } | ${item.role}</h3>
                <div>
                    <p class="val-message ${translate}" data-content="${nem}">
                        ${p}
                    </p>
                    <div class="status ${status}">
                        <div></div>
                    </div>
                </div>
            </div>
            <div class="spacing"></div>
        </div>
        `
        i++
    })

    return val
}

