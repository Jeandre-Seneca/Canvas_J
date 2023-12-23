# frozen_string_literal: true

#
# Copyright (C) 2011 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

module FileUploadHelper
  def create_fixture_attachment(attachment_context, fixture_filename)
    data = fixture_file_upload(fixture_filename)
    attachment_context.attachments.create!(display_name: "some file", uploaded_data: data)
  end

  def get_file_link(file, link_text = "Link")
    url = file_download_url(file)
    "<a href='#{url}'>#{link_text}</a>"
  end
end