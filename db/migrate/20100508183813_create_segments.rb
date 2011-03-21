class CreateSegments < ActiveRecord::Migration
  def self.up
    create_table :segments do |t|
      t.string 	 :simple, :null => false
      t.string 	 :pinyin, :null => false
      t.string 	 :trans, :null => false
    end

    add_index :segments, :simple
    add_index :segments, :pinyin
    add_index :segments, :trans
  end

  def self.down
    remove_index :segments, :simple
    remove_index :segments, :pinyin
    remove_index :segments, :trans

    drop_table :segments
  end
end
