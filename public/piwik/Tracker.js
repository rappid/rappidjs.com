define(['js/core/Component', 'js/core/Base', 'js/core/History', 'flow'], function(Component, Base, History, flow) {

    // TODO: build an own implementation
    // see http://piwik.org/docs/tracking-api/reference/

    return Component.inherit('piwik.Tracker', {

        defaults: {
            siteId: 1,
            piwikUrl: null,
            baseUrl: null,
            enableLinkTracking: true
        },

        initialize: function () {
            this.callBase();

            this.$trackQueue = [];
            this.$tracker = null;

            var history = this.$stage.$history,
                piwikUrl = this.$.piwikUrl;

            if (!history) {
                this.log("History not found.", Base.LOGLEVEL.ERROR);
                return;
            }

            if (!piwikUrl) {
                this.log("PiwikUrl not defined", Base.LOGLEVEL.WARN);
                return;
            }

            if (!/^.*\.php$/i.test(piwikUrl)) {
                piwikUrl = piwikUrl.replace(/\/$/, '')  + '/piwik.php';
            }

            if (this.runsInBrowser()) {
                // only track if we run inside a browser

                // bind to history events
                history.bind(History.EVENTS.NAVIGATION_COMPLETE, function(e) {
                    if (e.$.triggerRoute && e.$.createHistoryEntry) {
                        // track this fragment
                        this.track(e.$.fragment);
                        this._checkLinkTracking();
                    }
                }, this);

                var self = this;
                require(['Piwik'], function(Piwik) {
                    if (Piwik && Piwik.getAsyncTracker) {
                        var tracker = Piwik.getAsyncTracker();
                        if (tracker) {
                            tracker.setSiteId(self.$.siteId);
                            tracker.setTrackerUrl(piwikUrl);

                            self.$tracker = tracker;
                            self.trackQueue();

                            self._checkLinkTracking();
                        }
                    }
                })
            }
        },

        track: function(fragment) {
            var tracker = this.$tracker;

            if (tracker) {
                tracker.setCustomUrl(fragment, this.$.baseUrl + "?fragment=" + fragment);
                // Workaround as long as we do not have a HeadManager
                tracker.setDocumentTitle(fragment);
                tracker.trackPageView()
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
        },

        _checkLinkTracking: function() {
            if (this.$tracker && this.$.enableLinkTracking) {
                this.$tracker.enableLinkTracking();
            }
        },

        applicationRendered: function() {
            this._checkLinkTracking();
        }.bus('Application.Rendered')
    });

});