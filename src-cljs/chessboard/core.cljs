(ns chessboard.core
  (:require
    [clojure.string :refer [split]]
    [goog.events :as gevents]
    goog.object))

;;------------------------------------------------------------------------------
;; Util
;;------------------------------------------------------------------------------

(defn- js-log [js-thing]
  (js/console.log js-thing))

(defn- log [clj-thing]
  (js-log (pr-str clj-thing)))

(defn- error [code msg]
  ;; TODO: let them override this with a custom function
  (js-log (str "ChessBoard Error " code ": " msg)))

(defn- js-vals [js-obj]
  (let [values (array)]
    (goog.object/forEach js-obj (fn [val key obj] (.push values key)))
    values))

;;------------------------------------------------------------------------------
;; DOM Util
;;------------------------------------------------------------------------------

(defn- by-id [id]
  (.getElementById js/document id))

(defn- set-html! [id html]
  (aset (by-id id) "innerHTML" html))

;;------------------------------------------------------------------------------
;; CSS Classes
;;------------------------------------------------------------------------------

;; use unique class names to prevent clashing with anything else on the page
;; and simplify selectors
;; NOTE: these should never change
(def alpha-class "alpha-d2270")
(def black-class "black-3c85d")
(def board-class "board-b72b1")
(def chessboard-class "chessboard-63f37")
(def clearfix-class   "clearfix-7da63")
(def highlight1-class "highlight1-32417")
(def highlight2-class "highlight2-9c5d2")
(def notation-class   "notation-322f9")
(def numeric-class    "numeric-fc462")
(def piece-class "piece-417db")
(def row-class   "row-5277c")
(def spare-pieces-class  "spare-pieces-7492f")
(def spare-pieces-bottom "spare-pieces-bottom-ae20f")
(def spare-pieces-top    "spare-pieces-top-4028b")
(def square-class "square-55d63")
(def white-class  "white-1e1d7")

;;------------------------------------------------------------------------------
;; HTML
;;------------------------------------------------------------------------------

;; NOTE: I definitely prefer using something like Hiccups here, but since there
;; is so little of this I'm just using string concatenation to remove a library
;; dependency

(defn- board-shell []
  (str "<div class='" chessboard-class "'>"
    "<div class='" board-class "'></div>"
    "</div>"))

(defn- board [orientation]

  )

;;------------------------------------------------------------------------------
;; Validation
;;------------------------------------------------------------------------------

(defn- fen? [f]
  (and (string? f)
       true ;; TODO: write me
       ))

(def square-regex #"^[a-h][1-8]$")

(defn- square? [s]
  (and (string? s)
       (.test square-regex s)))

(defn- move? [m]
  (and (string? m)
       (let [arr (split m "-")]
         (and (= 2 (count arr))
              (square? (first arr))
              (square? (second arr))))))

(def piece-regex #"^[bw][KQRNBP]$")

(defn- piece-code? [p]
  (and (string? p)
       (.test piece-regex p)))

(defn- position-obj? [p]
  (and (object? p)
       (every? square? (js-keys p))
       (every? piece-code? (js-vals p))))

(defn- valid-config? [js-cfg]
  ;; TODO: write me
  true)

;;------------------------------------------------------------------------------
;; DOM Manipulation
;;------------------------------------------------------------------------------

(defn- redraw-board! [state]

  )

;;------------------------------------------------------------------------------
;; Public Methods
;;------------------------------------------------------------------------------

(defn- clear []

  )

(defn- destroy []

  )

(defn- fen []

  )

(defn- flip [state]
  (swap! state #(if (= % "white") "black" "white")))

(defn- move []

  )

(defn- orientation []

  )

(defn- position []

  )

(defn- resize []

  )

(defn- start []

  )

;;------------------------------------------------------------------------------
;; Browser Events
;;------------------------------------------------------------------------------

(def mousedown goog.events.EventType.MOUSEDOWN)
(def mouseenter goog.events.EventType.MOUSEENTER)
(def mouseleave goog.events.EventType.MOUSELEAVE)

(defn- mouseenter-container [js-evt]
  (js-log js-evt)
  )

(defn- mousedown-container [js-evt]
  (js-log js-evt)
  )

(defn- add-events! [container-el]
  (gevents/listen container-el mousedown mousedown-container)
  (gevents/listen container-el mouseenter mouseenter-container)
  )

;;------------------------------------------------------------------------------
;; State Change Functions
;;------------------------------------------------------------------------------

(defn- on-change-orientation [_the-atom _keyword old-state new-state]
  (when (not= (:orientation old-state)
              (:orientation new-state))
    (redraw-board! new-state)))

;;------------------------------------------------------------------------------
;; Constructor
;;------------------------------------------------------------------------------

(def default-state {
  :orientation "white"
  :position {}
  })

(defn- main [container-id js-cfg]
  (let [state (atom default-state)]

    (set-html! container-id (board-shell))
    (add-events! (by-id container-id))


    (add-watch state :orientation on-change-orientation)

    ;; return a JS object with methods
    (js-obj
      "clear" clear
      "destroy" destroy
      "fen" fen
      "flip" flip
      "move" move
      "orientation" orientation
      "position" position
      "resize" resize
      "start" start)))

(defn- js-main
  ([container-id] (js-main container-id (js-obj)))
  ([container-id js-cfg]
    (main container-id js-cfg)))

;; export to window.ChessBoard
(when-not (fn? (aget js/window "ChessBoard"))
  (aset js/window "ChessBoard" js-main))
