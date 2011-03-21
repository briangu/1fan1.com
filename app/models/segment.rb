class Segment < ActiveRecord::Base
      has_many :SimplifiedChar
      has_many :TraditionalChar
      has_many :Pinyin
      has_many :Translation
end
