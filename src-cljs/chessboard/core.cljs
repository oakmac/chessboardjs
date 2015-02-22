(ns chessboard.core
  (:require
    [clojure.string :refer [split]]
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
;; HTML
;;------------------------------------------------------------------------------

;; NOTE: definitely prefer hiccups here, but since there is so little of this
;; I'm just using strings to remove a library dependency

;; TODO: write these

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
  true)

;;------------------------------------------------------------------------------
;; Public Methods
;;------------------------------------------------------------------------------

(defn- clear []

  )

(defn- destroy []

  )

(defn- fen []

  )

(defn- flip []

  )

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
;; Constructor
;;------------------------------------------------------------------------------

(defn- main [cfg]

  )

(defn- js-main [container-id js-cfg]
  (let [container-el (by-id container-id)
        current-position (atom {})]
    (js-obj
      "clear" clear
      "destroy" destroy
      "fen" fen
      "flip" flip
      "move" move
      "orientation" orientation
      "position" position
      "resize" resize
      "start" start)
    ))

;; export to window.ChessBoard
(when-not (fn? (aget js/window "ChessBoard"))
  (aset js/window "ChessBoard" js-main))
