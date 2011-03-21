# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20100508183813) do

  create_table "segments", :force => true do |t|
    t.string "simple", :null => false
    t.string "pinyin", :null => false
    t.string "trans",  :null => false
  end

  add_index "segments", ["pinyin"], :name => "index_segments_on_pinyin"
  add_index "segments", ["simple"], :name => "index_segments_on_simple"
  add_index "segments", ["trans"], :name => "index_segments_on_trans"

end
