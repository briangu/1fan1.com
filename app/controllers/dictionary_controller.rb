class DictionaryController < ApplicationController

def lup
    segment = params[:segment]

    # @result = Segment.find_by_sql(["select *, (select max(length(simple)) from segments WHERE (? LIKE (simple || '%'))) as q from segments where (? LIKE (simple || '%')) AND length(simple) = q", segment, segment])
    # @result = Segment.find_by_sql(["select * from segments where (? LIKE (simple || '%')) order by length(simple) DESC", segment])

   @result = Segment.find(:all, :conditions => ["? LIKE (simple || '%')", segment], :order => "length(simple) DESC")

   respond_to do |format|
     format.html
     format.json { render :json => @result.to_json( :except => [:updated_at, :id, :q] ) }
     format.xml { render :xml => @result.to_xml(  :except => [:updated_at, :id, :q] ) }
   end    
end

end
