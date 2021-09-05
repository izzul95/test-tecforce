package com.tecforte.blog.service.mapper;

import com.tecforte.blog.domain.*;
import com.tecforte.blog.service.dto.BlogDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link Blog} and its DTO {@link BlogDTO}.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface BlogMapper extends EntityMapper<BlogDTO, Blog> {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.login", target = "userLogin")
    @Mapping(target = "entryCount", expression = "java(blog.getEntries().size())")
    BlogDTO toDto(Blog blog);

    @Mapping(target = "entries", ignore = true)
    @Mapping(target = "removeEntry", ignore = true)
    @Mapping(source = "userId", target = "user")
    Blog toEntity(BlogDTO blogDTO);

    default Blog fromId(Long id) {
        if (id == null) {
            return null;
        }
        Blog blog = new Blog();
        blog.setId(id);
        return blog;
    }
}
