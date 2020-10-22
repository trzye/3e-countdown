class ECountDown {

    interval = null;

    static INSTANCE = new ECountDown();

    init() {
        let params = new URLSearchParams(window.location.search);
        let share = params.get("share");
        try {
            if(share) {
                share = JSON.parse(decodeURIComponent(escape(atob(share))));
                let calculation = this.runCountDown(share.d, share.h, share.z, share.t);
                document.getElementById("submitForm").hidden = true;
                document.getElementById("countDown").hidden = false;
                document.title = "3E-COUNTDOWN | " + share.t + " | " + calculation.your.time + " (" + calculation.your.zone + ")";
                if(navigator.share){
                    document.getElementById("shareLink").hidden = false;
                }
            } else {
                document.title = "3E-COUNTDOWN | NEW"
            }
        } catch (e) {
            console.error(e);
        }
        this.initZones();
        document.getElementById("zone").value = DateUtils.getDefaultZone();
        document.getElementById("newEventLink").href = this.getBaseUrl();
    }

    share(){
        navigator
            .share({
                title: "3E-COUNTDOWN",
                text: document.title.replace("3E-COUNTDOWN |", ""),
                url: window.location.href
            })
    }

    submitClicked(event) {
        event.preventDefault();
        document.getElementById("error").hidden = true;
        try {
            let dateValue = event.target.date.value;
            let timeValue = event.target.time.value;
            let zoneValue = event.target.zone.value;
            let titleValue = event.target.title.value;
            this.runCountDown(dateValue, timeValue, zoneValue, titleValue);
            window.location = this.getShareUrl(dateValue, timeValue, zoneValue, titleValue);
        } catch (e) {
            document.getElementById("error").hidden = false;
            document.getElementById("error").innerText = e.toString().split(/:\s+/)[1];
            console.error(e);
        }
    }

    initZones() {
        let zones = DateUtils.getTimeZones();
        zones.sort();
        zones.forEach(zone => {
            let zoneElement = document.createElement("option");
            zoneElement.innerText = zone;
            document.getElementById("zones").appendChild(zoneElement);
        })
    }


    getShareUrl(dateValue, timeValue, zoneValue, titleValue) {
        return this.getBaseUrl() + "?share=" + btoa(unescape(encodeURIComponent(JSON.stringify({
            d: dateValue,
            h: timeValue,
            z: zoneValue,
            t: titleValue
        }))));
    }

    getBaseUrl() {
        return window.location.href.split('?')[0];
    }

    runCountDown(dateValue, timeValue, zoneValue, titleValue) {
        let date = new Date(dateValue + " " + timeValue);
        let calculation = this.calculateCountDown(date, zoneValue);

        document.getElementById("eventTitle").innerText = titleValue;
        document.getElementById("yourTime").innerText = calculation.your.time;
        document.getElementById("yourZone").innerText = calculation.your.zone;

        if(calculation.your.zone === calculation.their.zone){
            document.getElementById('theirTimeSection').hidden = true;
        } else {
            document.getElementById("theirTime").innerText = calculation.their.time;
            document.getElementById("theirZone").innerText = calculation.their.zone;
        }

        if (this.interval != null) clearInterval(this.interval);
        this.interval = setInterval(() => {

            let calculation = this.calculateCountDown(date, zoneValue);
            document.getElementById("untilHours").innerText = "" + calculation.until.hours;
            document.getElementById("untilMinutes").innerText = "" + calculation.until.minutes;
            document.getElementById("untilSecond").innerText = "" + calculation.until.seconds;
            if(calculation.until.hours === 0 && calculation.until.minutes === 0 && calculation.until.seconds >= -1 && calculation.until.seconds <= 20 ) {
                document.getElementById("warning").hidden = false;
                let shakeNumber = Math.round(calculation.until.seconds/2);
                document.getElementsByTagName("body")[0].className = "shake" + shakeNumber;
                for(let i = 1; i< 8; i++) {
                    document.getElementsByTagName("div")[i].className = "shake" + shakeNumber;
                }
                if(calculation.until.seconds === -1) {
                    window.location = window.location.href;
                }
            } else {
                document.getElementsByTagName("body")[0].className = "";
            }

        }, 500);
        return calculation;
    }


    calculateCountDown(date, zone) {
        date = DateUtils.getDateInZone(date, zone);
        let yourLocale = Intl.NumberFormat().resolvedOptions().locale;
        let yourTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        let yourTime = Intl.DateTimeFormat(yourLocale, {
            dateStyle: "short",
            timeStyle: 'short',
            timeZone: yourTimeZone
        }).format(date);

        let theirTime = Intl.DateTimeFormat(yourLocale, {
            dateStyle: "short",
            timeStyle: 'short',
            timeZone: zone
        }).format(date);

        return {
            until: DateUtils.msToTime(date.getTime() - new Date().getTime()),
            your: {zone: yourTimeZone, time: yourTime},
            their: {zone: zone, time: theirTime}
        };
    }

}