define(['js/core/Component', 'js/core/Base', 'js/core/History', 'flow'], function(Component, Base, History, flow) {

    return Component.inherit('piwik.Tracker', {

        defaults: {
            siteId: 1,
            piwikUrl: null,
            baseUrl: null
        },

        initialize: function () {
            this.callBase();

            this.$trackQueue = [];
            this.$tracker = null;

            var history = this.$systemManager.$application.history;
            if (!history) {
                this.log("History not found.", Base.LOGLEVEL.ERROR);
                return;
            }

            if (!this.$.piwikUrl) {
                this.log("PiwikUrl not defined", Base.LOGLEVEL.WARN);
                return;
            }

            if (this.runsInBrowser()) {
                // only track if we run inside a browser

                // bind to history events
                history.bind(History.EVENTS.NAVIGATION_COMPLETE, function(e) {
                    if (e.$.triggerRoute && e.$.createHistoryEntry) {
                        // track this fragment
                        this.track(e.$.fragment)
                    }
                }, this);

                var self = this;
                require(['Piwik'], function(Piwik) {
                    if (Piwik && Piwik.getAsyncTracker) {
                        var tracker = Piwik.getAsyncTracker();
                        if (tracker) {
                            tracker.setSiteId(self.$.siteId);
                            tracker.setTrackerUrl(self.$.piwikUrl);

                            self.$tracker = tracker;
                            self.trackQueue();
                        }
                    }
                })
            }
        },

        track: function(fragment) {
            if (this.$tracker) {
                this.$tracker.setCustomUrl(fragment, this.$.baseUrl + "/#!/" + fragment);
                this.$tracker.trackPageView()
            } else {
                this.$trackQueue.push(fragment);
            }
        },

        trackQueue: function() {
            var self = this;
            // track all events from queue
            flow()
                .seqEach(this.$trackQueue, function(value, cb) {
                    setTimeout(function() {
                        self.track(value);
                        cb();
                    }, 500);
                })
                .exec();
        }
    });

});